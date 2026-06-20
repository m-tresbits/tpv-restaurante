import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { OrdersApiService } from '../../../../core/api/services/orders-api.service';
import { ProductsApiService } from '../../../../core/api/services/products-api.service';
import { StockApiService } from '../../../../core/api/services/stock-api.service';
import { TablesApiService } from '../../../../core/api/services/tables-api.service';
import { Order, OrderDetail, OrderDetailStatus } from '../../../../shared/models/order.model';
import { Product } from '../../../../shared/models/product.model';
import { ProductStock } from '../../../../shared/models/stock.model';
import { RestaurantTable, TableStatus } from '../../../../shared/models/table.model';

type PendingOrderItem = {
  id: number;
  orderId: number;
  product: Product;
  observaciones?: string;
};

@Component({
  selector: 'app-waiter-home',
  templateUrl: './waiter-home.html',
  styleUrl: './waiter-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaiterHome implements OnInit {
  private readonly tablesApiService = inject(TablesApiService);
  private readonly productsApiService = inject(ProductsApiService);
  private readonly stockApiService = inject(StockApiService);
  private readonly ordersApiService = inject(OrdersApiService);
  private readonly destroyRef = inject(DestroyRef);

  private isRefreshingWaiterData = false;
  private nextPendingOrderItemId = -1;

  protected readonly tables = signal<RestaurantTable[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly stock = signal<ProductStock[]>([]);
  protected readonly openOrders = signal<Order[]>([]);
  protected readonly selectedTable = signal<RestaurantTable | null>(null);
  protected readonly activeOrder = signal<Order | null>(null);
  protected readonly pendingOrderItems = signal<PendingOrderItem[]>([]);
  protected readonly acknowledgedReadyDetailIds = signal<Set<number>>(new Set());
  protected readonly isMenuVisible = signal(false);
  protected readonly nextProductObservation = signal('');

  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    const timerId = window.setInterval(() => this.refreshWaiterData(), 5_000);
    this.destroyRef.onDestroy(() => window.clearInterval(timerId));
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  protected reload(): void {
    this.loadInitialData();
  }

  protected selectTable(table: RestaurantTable): void {
    const order = this.findOpenOrderByTable(table.id);

    this.selectedTable.set(table);
    this.activeOrder.set(order);
    this.acknowledgeReadyDetails(order);
    this.setInitialMenuVisibility(order);
  }

  protected tableStatusLabel(status: TableStatus): string {
    const labels: Record<TableStatus, string> = {
      LIBRE: 'Libre',
      OCUPADA: 'Ocupada',
      RESERVADA: 'Reservada',
      INACTIVA: 'Inactiva',
    };

    return labels[status];
  }

  protected canOpenOrder(table: RestaurantTable): boolean {
    return table.estado === 'LIBRE' || table.estado === 'OCUPADA';
  }

  protected hasOpenOrder(table: RestaurantTable): boolean {
    return this.findOpenOrderByTable(table.id) !== null;
  }

  protected manageOrderLabel(table: RestaurantTable): string {
    const order = this.findOpenOrderByTable(table.id);

    if (!order) {
      return 'Crear pedido';
    }

    if (this.selectedTable()?.id !== table.id || this.activeOrder()?.id !== order.id) {
      return 'Abrir pedido activo';
    }

    if (!this.canAddProducts(order)) {
      return 'Abrir pedido activo';
    }

    return this.isMenuVisible() ? 'CARTA -' : 'CARTA +';
  }

  protected isMenuToggleAction(table: RestaurantTable): boolean {
    const order = this.findOpenOrderByTable(table.id);

    return (
      this.selectedTable()?.id === table.id &&
      this.activeOrder()?.id === order?.id &&
      !!order &&
      this.canAddProducts(order)
    );
  }

  protected canEditOrder(order: Order): boolean {
    return order.estado === 'ABIERTO';
  }

  protected canAddProducts(order: Order): boolean {
    return order.estado === 'ABIERTO' || order.estado === 'EN_COCINA';
  }

  protected orderStatusLabel(order: Order): string {
    if (order.estado === 'ABIERTO') {
      return `Pedido activo #${order.id}`;
    }

    if (order.estado === 'EN_COCINA') {
      return `Pedido #${order.id} en cocina`;
    }

    return `Pedido #${order.id}`;
  }

  protected canSendToKitchen(order: Order): boolean {
    const pendingItemsCount = this.pendingItemsForOrder(order).length;

    if (order.estado === 'ABIERTO') {
      return this.orderDetails(order).length + pendingItemsCount > 0;
    }

    return order.estado === 'EN_COCINA' && pendingItemsCount > 0;
  }

  protected sendToKitchenLabel(order: Order): string {
    return order.estado === 'EN_COCINA' ? 'Enviar nuevos productos a cocina' : 'Enviar a cocina';
  }

  protected productsSectionTitle(order: Order): string {
    return order.estado === 'EN_COCINA'
      ? 'Añadir productos adicionales al pedido'
      : 'Carta disponible';
  }

  protected orderHelperText(order: Order): string {
    if (order.estado === 'ABIERTO') {
      return 'Puedes añadir productos y editar líneas antes de enviar a cocina.';
    }

    if (order.estado === 'EN_COCINA') {
      return 'Puedes añadir nuevos productos, pero no modificar líneas ya enviadas.';
    }

    return 'Pedido en modo solo lectura para camarero.';
  }

  protected canCloseOrder(order: Order): boolean {
    return order.estado !== 'CERRADO' && order.estado !== 'CANCELADO';
  }

  protected orderDetails(order: Order): OrderDetail[] {
    return [...(order.details ?? [])].sort((firstDetail, secondDetail) => {
      const firstCreatedAt = new Date(firstDetail.createdAt).getTime();
      const secondCreatedAt = new Date(secondDetail.createdAt).getTime();

      if (firstCreatedAt !== secondCreatedAt) {
        return firstCreatedAt - secondCreatedAt;
      }

      return firstDetail.id - secondDetail.id;
    });
  }

  protected getDetailStatusLabel(status: OrderDetailStatus): string {
    const labels: Record<OrderDetailStatus, string> = {
      PENDIENTE: 'Pendiente',
      EN_PREPARACION: 'En preparación',
      LISTO: 'Listo para servir',
      SERVIDO: 'Servido',
      CANCELADO: 'Cancelado',
    };

    return labels[status];
  }

  protected hasReadyNotification(table: RestaurantTable): boolean {
    const order = this.findOpenOrderByTable(table.id);

    if (!order) {
      return false;
    }

    return this.getReadyDetails(order).some(
      (detail) => !this.acknowledgedReadyDetailIds().has(detail.id),
    );
  }

  protected canServeDetail(order: Order, detail: OrderDetail): boolean {
    return order.estado !== 'CERRADO' && order.estado !== 'CANCELADO' && detail.estado === 'LISTO';
  }

  protected pendingItemsForOrder(order: Pick<Order, 'id'>): PendingOrderItem[] {
    return this.pendingOrderItems().filter((item) => item.orderId === order.id);
  }

  protected availableStock(product: Pick<Product, 'id'>): number {
    return Number(this.findStockByProduct(product)?.cantidad ?? 0);
  }

  protected hasAvailableStock(product: Pick<Product, 'id'>): boolean {
    return this.availableStock(product) > 0;
  }

  protected stockLabel(product: Product): string {
    const stock = this.findStockByProduct(product);

    if (!stock) {
      return 'Sin stock configurado';
    }

    if (stock.cantidad <= 0) {
      return 'Sin stock disponible';
    }

    return `Stock: ${stock.cantidad}`;
  }

  protected occupyTable(table: RestaurantTable): void {
    this.updateTableStatus(table.id, 'OCUPADA');
  }

  protected reserveTable(table: RestaurantTable): void {
    this.updateTableStatus(table.id, 'RESERVADA');
  }

  protected releaseTable(table: RestaurantTable): void {
    if (this.hasOpenOrder(table)) {
      this.errorMessage.set(
        'No se puede liberar una mesa con un pedido activo. Cierra o cancela el pedido primero.',
      );
      return;
    }

    this.updateTableStatus(table.id, 'LIBRE');
    this.activeOrder.set(null);
  }

  protected cancelReservation(table: RestaurantTable): void {
    this.updateTableStatus(table.id, 'LIBRE');
  }

  protected manageOrder(table: RestaurantTable): void {
    if (!this.canOpenOrder(table) || this.isSaving()) {
      return;
    }

    const currentOrder = this.activeOrder();

    if (this.selectedTable()?.id === table.id && currentOrder) {
      if (this.canAddProducts(currentOrder)) {
        this.isMenuVisible.update((visible) => !visible);
      }

      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.ordersApiService.findOpen().subscribe({
      next: (orders) => {
        this.openOrders.set(orders);
        this.tables.update((tables) => this.reconcileTablesWithOpenOrders(tables, orders));

        const openedOrder = orders.find((order) => order.table.id === table.id);

        if (openedOrder) {
          this.upsertOpenOrder(openedOrder);
          this.activeOrder.set(openedOrder);
          this.replaceTable(openedOrder.table);
          this.selectedTable.set(openedOrder.table);
          this.acknowledgeReadyDetails(openedOrder);
          this.setInitialMenuVisibility(openedOrder);
          this.isSaving.set(false);
          return;
        }

        this.createOrder(table);
      },
      error: () => {
        this.errorMessage.set('No se han podido consultar los pedidos abiertos.');
        this.isSaving.set(false);
      },
    });
  }

  protected addProductToOrder(product: Product): void {
    const order = this.activeOrder();

    if (!order || !this.canAddProducts(order) || this.isSaving()) {
      return;
    }

    if (!this.hasAvailableStock(product)) {
      this.errorMessage.set(this.stockLabel(product));
      this.refreshWaiterData(false, true);
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const observation = this.nextProductObservation().trim();

    this.pendingOrderItems.update((items) => [
      ...items,
      {
        id: this.nextPendingOrderItemId--,
        orderId: order.id,
        product,
        ...(observation ? { observaciones: observation } : {}),
      },
    ]);
    this.decreaseProductStock(product.id);
    this.nextProductObservation.set('');
    this.isSaving.set(false);
  }

  protected updateNextProductObservation(value: string): void {
    this.nextProductObservation.set(value);
  }

  protected removePendingOrderItem(item: PendingOrderItem): void {
    if (this.isSaving()) {
      return;
    }

    this.pendingOrderItems.update((items) => items.filter((pendingItem) => pendingItem.id !== item.id));
    this.increaseProductStock(item.product.id, 1);
  }

  protected removeDetail(detail: OrderDetail): void {
    const order = this.activeOrder();

    if (!order || !this.canEditOrder(order) || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.ordersApiService.removeItem(order.id, detail.id).subscribe({
      next: (updatedOrder) => {
        this.syncUpdatedOrder(updatedOrder);
        this.increaseProductStock(detail.product.id, detail.cantidad);
        this.isSaving.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getApiErrorMessage(error, 'No se ha podido eliminar la línea del pedido.'),
        );
        this.isSaving.set(false);
      },
    });
  }

  protected getLineSubtotal(detail: OrderDetail): string {
    return `${(detail.cantidad * Number(detail.precioUnitario)).toFixed(2)} €`;
  }

  protected getPendingLineSubtotal(item: PendingOrderItem): string {
    return `${Number(item.product.precio).toFixed(2)} €`;
  }

  protected markDetailServed(detail: OrderDetail): void {
    const order = this.activeOrder();

    if (!order || !this.canServeDetail(order, detail) || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.ordersApiService.updateDetailStatus(order.id, detail.id, { estado: 'SERVIDO' }).subscribe({
      next: (updatedOrder) => {
        this.syncUpdatedOrder(updatedOrder);
        this.acknowledgedReadyDetailIds.update((ids) => {
          const updatedIds = new Set(ids);
          updatedIds.delete(detail.id);

          return updatedIds;
        });
        this.isSaving.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getApiErrorMessage(error, 'No se ha podido marcar la línea como servida.'),
        );
        this.isSaving.set(false);
      },
    });
  }

  protected sendOrderToKitchen(): void {
    const order = this.activeOrder();

    if (!order || !this.canSendToKitchen(order) || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.pendingItemsForOrder(order).length > 0) {
      this.sendPendingItemsToKitchen(order);
      return;
    }

    this.sendOrderToKitchenRequest(order);
  }

  private sendOrderToKitchenRequest(order: Order): void {
    this.ordersApiService.sendToKitchen(order.id).subscribe({
      next: (updatedOrder) => {
        this.upsertOpenOrder(updatedOrder);
        this.activeOrder.set(updatedOrder);
        this.replaceTable(updatedOrder.table);
        this.selectedTable.set(updatedOrder.table);
        this.pendingOrderItems.update((items) =>
          items.filter((pendingItem) => pendingItem.orderId !== updatedOrder.id),
        );
        this.isMenuVisible.set(false);
        this.isSaving.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getApiErrorMessage(error, 'No se ha podido enviar el pedido a cocina.'),
        );
        this.isSaving.set(false);
      },
    });
  }

  private sendPendingItemsToKitchen(order: Order): void {
    const pendingItems = this.pendingItemsForOrder(order);

    if (pendingItems.length === 0) {
      this.isSaving.set(false);
      return;
    }

    this.sendPendingItemToKitchen(order, pendingItems, 0);
  }

  private sendPendingItemToKitchen(order: Order, pendingItems: PendingOrderItem[], index: number): void {
    const item = pendingItems[index];

    if (!item) {
      this.pendingOrderItems.update((items) =>
        items.filter((pendingItem) => pendingItem.orderId !== order.id),
      );

      if (order.estado === 'ABIERTO') {
        this.sendOrderToKitchenRequest(order);
        return;
      }

      this.isMenuVisible.set(false);
      this.isSaving.set(false);
      return;
    }

    this.ordersApiService
      .addItem(order.id, {
        productoId: item.product.id,
        cantidad: 1,
        ...(item.observaciones ? { observaciones: item.observaciones } : {}),
      })
      .subscribe({
        next: (updatedOrder) => {
          this.syncUpdatedOrder(updatedOrder);
          this.sendPendingItemToKitchen(updatedOrder, pendingItems, index + 1);
        },
        error: (error: unknown) => {
          const sentItemIds = new Set(pendingItems.slice(0, index).map((sentItem) => sentItem.id));

          this.pendingOrderItems.update((items) =>
            items.filter((pendingItem) => !sentItemIds.has(pendingItem.id)),
          );
          this.errorMessage.set(
            this.getApiErrorMessage(error, 'No se han podido enviar los nuevos productos a cocina.'),
          );
          this.refreshWaiterData(false, true);
          this.isSaving.set(false);
        },
      });
  }

  protected closeOrder(): void {
    const order = this.activeOrder();

    if (!order || !this.canCloseOrder(order) || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.ordersApiService.close(order.id).subscribe({
      next: (updatedOrder) => {
        this.finishOrder(updatedOrder);
      },
      error: (error: unknown) => {
        this.errorMessage.set(this.getApiErrorMessage(error, 'No se ha podido cerrar el pedido.'));
        this.isSaving.set(false);
      },
    });
  }

  protected cancelOrder(): void {
    const order = this.activeOrder();

    if (!order || !this.canCloseOrder(order) || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.ordersApiService.cancel(order.id).subscribe({
      next: (updatedOrder) => {
        this.finishOrder(updatedOrder);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getApiErrorMessage(error, 'No se ha podido cancelar el pedido.'),
        );
        this.isSaving.set(false);
      },
    });
  }

  private createOrder(table: RestaurantTable): void {
    this.ordersApiService.create({ mesaId: table.id }).subscribe({
      next: (order) => {
        this.upsertOpenOrder(order);
        this.activeOrder.set(order);
        this.replaceTable(order.table);
        this.selectedTable.set(order.table);
        this.isMenuVisible.set(true);
        this.isSaving.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getApiErrorMessage(
            error,
            'No se ha podido crear el pedido para la mesa seleccionada.',
          ),
        );
        this.isSaving.set(false);
      },
    });
  }

  private loadInitialData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      tables: this.tablesApiService.findActive(),
      products: this.productsApiService.findAvailable(),
      stock: this.stockApiService.findAll(),
      openOrders: this.ordersApiService.findOpen(),
    }).subscribe({
      next: ({ tables, products, stock, openOrders }) => {
        this.openOrders.set(openOrders);
        this.tables.set(this.reconcileTablesWithOpenOrders(tables, openOrders));
        this.products.set(products);
        this.stock.set(this.applyPendingStockReservations(stock));
        this.syncSelectedTable(this.tables());
        this.syncActiveOrder(openOrders);
        this.isLoading.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getApiErrorMessage(error, 'No se han podido cargar los datos del camarero.'),
        );
        this.isLoading.set(false);
      },
    });
  }

  private refreshWaiterData(showError = false, ignoreSaving = false): void {
    if ((!ignoreSaving && this.isSaving()) || this.isRefreshingWaiterData) {
      return;
    }

    this.isRefreshingWaiterData = true;

    forkJoin({
      products: this.productsApiService.findAvailable(),
      stock: this.stockApiService.findAll(),
      openOrders: this.ordersApiService.findOpen(),
    }).subscribe({
      next: ({ products, stock, openOrders }) => {
        if (ignoreSaving || !this.isSaving()) {
          this.products.set(products);
          this.stock.set(this.applyPendingStockReservations(stock));
          this.openOrders.set(openOrders);
          this.tables.update((tables) => this.reconcileTablesWithOpenOrders(tables, openOrders));
          this.syncSelectedTable(this.tables());
          this.syncActiveOrderFromPolling(openOrders);
        }

        this.isRefreshingWaiterData = false;
      },
      error: (error: unknown) => {
        if (showError) {
          this.errorMessage.set(
            this.getApiErrorMessage(error, 'No se han podido actualizar los datos del camarero.'),
          );
        }

        this.isRefreshingWaiterData = false;
      },
    });
  }

  private updateTableStatus(tableId: number, estado: TableStatus): void {
    if (this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.tablesApiService.updateStatus(tableId, { estado }).subscribe({
      next: (updatedTable) => {
        this.replaceTable(updatedTable);
        this.selectedTable.set(updatedTable);
        this.isSaving.set(false);
      },
      error: (error: unknown) => {
        this.errorMessage.set(
          this.getApiErrorMessage(error, 'No se ha podido actualizar el estado de la mesa.'),
        );
        this.isSaving.set(false);
      },
    });
  }

  private replaceTable(updatedTable: RestaurantTable): void {
    this.tables.update((tables) =>
      this.reconcileTablesWithOpenOrders(
        tables.map((table) => (table.id === updatedTable.id ? updatedTable : table)),
        this.openOrders(),
      ),
    );
  }

  private finishOrder(order: Order): void {
    this.openOrders.update((orders) => orders.filter((openOrder) => openOrder.id !== order.id));
    this.pendingOrderItems.update((items) =>
      items.filter((pendingItem) => pendingItem.orderId !== order.id),
    );
    this.activeOrder.set(null);
    this.isMenuVisible.set(false);
    this.replaceTable(order.table);
    this.selectedTable.set(order.table);
    this.isSaving.set(false);
  }

  private upsertOpenOrder(order: Order): void {
    this.openOrders.update((orders) => {
      const exists = orders.some((openOrder) => openOrder.id === order.id);

      if (exists) {
        return orders.map((openOrder) => (openOrder.id === order.id ? order : openOrder));
      }

      return [order, ...orders];
    });
  }

  private decreaseProductStock(productId: number): void {
    this.adjustProductStock(productId, -1);
  }

  private increaseProductStock(productId: number, quantity: number): void {
    this.adjustProductStock(productId, quantity);
  }

  private adjustProductStock(productId: number, quantityDifference: number): void {
    this.stock.update((currentStock) =>
      currentStock.map((stock) => {
        if (stock.product.id !== productId) {
          return stock;
        }

        return {
          ...stock,
          cantidad: Math.max(stock.cantidad + quantityDifference, 0),
        };
      }),
    );
  }

  private applyPendingStockReservations(stock: ProductStock[]): ProductStock[] {
    const reservedByProduct = this.pendingOrderItems().reduce((reserved, item) => {
      reserved.set(item.product.id, (reserved.get(item.product.id) ?? 0) + 1);
      return reserved;
    }, new Map<number, number>());

    return stock.map((stockItem) => ({
      ...stockItem,
      cantidad: Math.max(stockItem.cantidad - (reservedByProduct.get(stockItem.product.id) ?? 0), 0),
    }));
  }

  private syncUpdatedOrder(updatedOrder: Order): void {
    this.upsertOpenOrder(updatedOrder);
    this.activeOrder.set(updatedOrder);
    this.replaceTable(updatedOrder.table);
    this.selectedTable.set(updatedOrder.table);
  }

  private setInitialMenuVisibility(order: Order | null): void {
    this.isMenuVisible.set(order?.estado === 'ABIERTO');
  }

  private acknowledgeReadyDetails(order: Order | null): void {
    if (!order) {
      return;
    }

    const readyDetailIds = this.getReadyDetails(order).map((detail) => detail.id);

    if (readyDetailIds.length === 0) {
      return;
    }

    this.acknowledgedReadyDetailIds.update((ids) => new Set([...ids, ...readyDetailIds]));
  }

  private getReadyDetails(order: Order): OrderDetail[] {
    return this.orderDetails(order).filter((detail) => detail.estado === 'LISTO');
  }

  private findStockByProduct(product: Pick<Product, 'id'>): ProductStock | null {
    return this.stock().find((stock) => Number(stock.product?.id) === Number(product.id)) ?? null;
  }

  private findOpenOrderByTable(tableId: number): Order | null {
    return this.openOrders().find((order) => order.table.id === tableId) ?? null;
  }

  private reconcileTablesWithOpenOrders(
    tables: RestaurantTable[],
    openOrders: Order[],
  ): RestaurantTable[] {
    const openOrderTableIds = new Set(openOrders.map((order) => order.table.id));

    return tables.map((table) => {
      if (!openOrderTableIds.has(table.id) || table.estado === 'OCUPADA') {
        return table;
      }

      return {
        ...table,
        estado: 'OCUPADA',
      };
    });
  }

  private syncActiveOrder(openOrders: Order[]): void {
    const selectedTable = this.selectedTable();

    if (!selectedTable) {
      this.activeOrder.set(null);
      this.isMenuVisible.set(false);
      return;
    }

    const order = openOrders.find((openOrder) => openOrder.table.id === selectedTable.id) ?? null;

    this.activeOrder.set(order);

    if (!order || !this.canAddProducts(order)) {
      this.isMenuVisible.set(false);
    }
  }

  private syncActiveOrderFromPolling(openOrders: Order[]): void {
    const activeOrder = this.activeOrder();
    const selectedTable = this.selectedTable();

    if (!activeOrder && !selectedTable) {
      return;
    }

    const updatedOrder = activeOrder
      ? openOrders.find((openOrder) => openOrder.id === activeOrder.id)
      : openOrders.find((openOrder) => openOrder.table.id === selectedTable?.id);

    if (updatedOrder) {
      this.activeOrder.set(updatedOrder);

      if (!this.canAddProducts(updatedOrder)) {
        this.isMenuVisible.set(false);
      }
    }
  }

  private getApiErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
      return fallback;
    }

    const responseMessage = error.error?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(' ');
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }

    return fallback;
  }

  private isStockInsufficientMessage(message: string): boolean {
    return message.toLocaleLowerCase().includes('stock');
  }

  private syncSelectedTable(tables: RestaurantTable[]): void {
    const currentSelectedTable = this.selectedTable();

    if (!currentSelectedTable) {
      return;
    }

    const updatedSelectedTable = tables.find((table) => table.id === currentSelectedTable.id);

    this.selectedTable.set(updatedSelectedTable ?? null);
  }
}
