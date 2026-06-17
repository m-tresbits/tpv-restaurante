import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { OrdersApiService } from '../../../../core/api/services/orders-api.service';
import { ProductsApiService } from '../../../../core/api/services/products-api.service';
import { TablesApiService } from '../../../../core/api/services/tables-api.service';
import { Order, OrderDetail } from '../../../../shared/models/order.model';
import { Product } from '../../../../shared/models/product.model';
import { RestaurantTable, TableStatus } from '../../../../shared/models/table.model';

@Component({
  selector: 'app-waiter-home',
  templateUrl: './waiter-home.html',
  styleUrl: './waiter-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaiterHome implements OnInit {
  private readonly tablesApiService = inject(TablesApiService);
  private readonly productsApiService = inject(ProductsApiService);
  private readonly ordersApiService = inject(OrdersApiService);

  protected readonly tables = signal<RestaurantTable[]>([]);
  protected readonly products = signal<Product[]>([]);
  protected readonly openOrders = signal<Order[]>([]);
  protected readonly selectedTable = signal<RestaurantTable | null>(null);
  protected readonly activeOrder = signal<Order | null>(null);

  protected readonly isLoading = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadInitialData();
  }

  protected reload(): void {
    this.loadInitialData();
  }

  protected selectTable(table: RestaurantTable): void {
    this.selectedTable.set(table);
    this.activeOrder.set(this.findOpenOrderByTable(table.id));
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

  protected tableStatusClass(status: TableStatus): string {
    return `waiter-home__table--${status.toLowerCase()}`;
  }

  protected canOpenOrder(table: RestaurantTable): boolean {
    return table.estado === 'LIBRE' || table.estado === 'OCUPADA';
  }

  protected hasOpenOrder(table: RestaurantTable): boolean {
    return this.findOpenOrderByTable(table.id) !== null;
  }

  protected manageOrderLabel(table: RestaurantTable): string {
    return this.hasOpenOrder(table) ? 'Abrir pedido activo' : 'Crear pedido';
  }

  protected canEditOrder(order: Order): boolean {
    return order.estado === 'ABIERTO';
  }

  protected canSendToKitchen(order: Order): boolean {
    return order.estado === 'ABIERTO' && this.orderDetails(order).length > 0;
  }

  protected canCloseOrder(order: Order): boolean {
    return order.estado !== 'CERRADO' && order.estado !== 'CANCELADO';
  }

  protected orderDetails(order: Order): OrderDetail[] {
    return order.details ?? [];
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

    if (!order || !this.canEditOrder(order) || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.ordersApiService
      .addItem(order.id, {
        productoId: product.id,
        cantidad: 1,
      })
      .subscribe({
        next: (updatedOrder) => {
          this.upsertOpenOrder(updatedOrder);
          this.activeOrder.set(updatedOrder);
          this.replaceTable(updatedOrder.table);
          this.selectedTable.set(updatedOrder.table);
          this.isSaving.set(false);
        },
        error: () => {
          this.errorMessage.set('No se ha podido añadir el producto al pedido.');
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

    this.ordersApiService.sendToKitchen(order.id).subscribe({
      next: (updatedOrder) => {
        this.upsertOpenOrder(updatedOrder);
        this.activeOrder.set(updatedOrder);
        this.replaceTable(updatedOrder.table);
        this.selectedTable.set(updatedOrder.table);
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('No se ha podido enviar el pedido a cocina.');
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
      error: () => {
        this.errorMessage.set('No se ha podido cerrar el pedido.');
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
      error: () => {
        this.errorMessage.set('No se ha podido cancelar el pedido.');
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
        this.isSaving.set(false);
      },
      error: () => {
        this.errorMessage.set('No se ha podido crear el pedido para la mesa seleccionada.');
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
      openOrders: this.ordersApiService.findOpen(),
    }).subscribe({
      next: ({ tables, products, openOrders }) => {
        this.openOrders.set(openOrders);
        this.tables.set(this.reconcileTablesWithOpenOrders(tables, openOrders));
        this.products.set(products);
        this.syncSelectedTable(this.tables());
        this.syncActiveOrder(openOrders);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se han podido cargar los datos del camarero.');
        this.isLoading.set(false);
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
      error: () => {
        this.errorMessage.set('No se ha podido actualizar el estado de la mesa.');
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
    this.activeOrder.set(null);
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
      return;
    }

    this.activeOrder.set(openOrders.find((order) => order.table.id === selectedTable.id) ?? null);
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
