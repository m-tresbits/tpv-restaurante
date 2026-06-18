import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';

import { OrdersApiService } from '../../../../core/api/services/orders-api.service';
import { Order, OrderDetail, OrderDetailStatus } from '../../../../shared/models/order.model';

@Component({
  selector: 'app-kitchen-home',
  templateUrl: './kitchen-home.html',
  styleUrl: './kitchen-home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KitchenHome {
  private readonly ordersApiService = inject(OrdersApiService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly orders = signal<Order[]>([]);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly updatingDetailId = signal<number | null>(null);
  protected readonly now = signal(Date.now());

  protected readonly kitchenOrders = computed(() =>
    this.orders()
      .filter((order) => order.estado === 'EN_COCINA' && this.getKitchenDetails(order).length > 0)
      .sort(
        (firstOrder, secondOrder) =>
          new Date(firstOrder.fechaCreacion).getTime() -
          new Date(secondOrder.fechaCreacion).getTime(),
      ),
  );

  constructor() {
    this.loadOrders();

    const timerId = window.setInterval(() => this.now.set(Date.now()), 1_000);
    this.destroyRef.onDestroy(() => window.clearInterval(timerId));
  }

  protected loadOrders(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.ordersApiService.findOpen().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se han podido cargar las comandas de cocina.');
        this.isLoading.set(false);
      },
    });
  }

  protected updateDetailStatus(orderId: number, detailId: number, status: OrderDetailStatus): void {
    if (this.updatingDetailId() !== null) {
      return;
    }

    this.updatingDetailId.set(detailId);
    this.errorMessage.set(null);

    this.ordersApiService.updateDetailStatus(orderId, detailId, { estado: status }).subscribe({
      next: (updatedOrder) => {
        this.orders.update((orders) =>
          orders.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)),
        );
        this.updatingDetailId.set(null);
      },
      error: () => {
        this.errorMessage.set('No se ha podido actualizar el estado de la línea.');
        this.updatingDetailId.set(null);
      },
    });
  }

  protected getNextStatus(status: OrderDetailStatus): OrderDetailStatus | null {
    if (status === 'PENDIENTE') {
      return 'EN_PREPARACION';
    }

    if (status === 'EN_PREPARACION') {
      return 'LISTO';
    }

    return null;
  }

  protected advanceDetailStatus(orderId: number, detail: OrderDetail): void {
    const nextStatus = this.getNextStatus(detail.estado);

    if (!nextStatus) {
      return;
    }

    this.updateDetailStatus(orderId, detail.id, nextStatus);
  }

  protected getStatusLabel(status: OrderDetailStatus): string {
    const labels: Record<OrderDetailStatus, string> = {
      PENDIENTE: 'Pendiente',
      EN_PREPARACION: 'En preparación',
      LISTO: 'Listo',
      SERVIDO: 'Servido',
      CANCELADO: 'Cancelado',
    };

    return labels[status];
  }

  protected getActionLabel(status: OrderDetailStatus): string {
    if (status === 'PENDIENTE') {
      return 'Iniciar preparación';
    }

    if (status === 'EN_PREPARACION') {
      return 'Marcar como listo';
    }

    return 'Sin acción';
  }

  protected getOrderTotal(order: Order): string {
    return `${Number(order.total).toFixed(2)} €`;
  }

  protected getKitchenElapsed(order: Order): string {
    const now = this.now();
    const baseDate = order.fechaEnvioCocina ?? order.updatedAt ?? order.fechaCreacion;
    const elapsedSeconds = Math.max(0, Math.floor((now - new Date(baseDate).getTime()) / 1_000));
    const hours = Math.floor(elapsedSeconds / 3_600);
    const minutes = Math.floor((elapsedSeconds % 3_600) / 60);
    const seconds = elapsedSeconds % 60;

    if (hours <= 0) {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  protected getLineTotal(cantidad: number, precioUnitario: string): string {
    return `${(cantidad * Number(precioUnitario)).toFixed(2)} €`;
  }

  protected getKitchenDetails(order: Order): OrderDetail[] {
    return order.details.filter((detail) => detail.estado !== 'SERVIDO');
  }

  protected isOrderReady(order: Order): boolean {
    const details = this.getKitchenDetails(order);

    return details.length > 0 && details.every((detail) => detail.estado === 'LISTO');
  }

  protected getDetailTone(productName: string, categoryName?: string | null): string {
    const text = `${productName} ${categoryName}`.toLowerCase();

    if (text.includes('hamburg') || text.includes('burger')) {
      return 'burger';
    }

    if (text.includes('pizza')) {
      return 'pizza';
    }

    if (text.includes('carne') || text.includes('entrecot') || text.includes('pollo')) {
      return 'meat';
    }

    if (
      text.includes('entrante') ||
      text.includes('tapa') ||
      text.includes('racion') ||
      text.includes('ración') ||
      text.includes('patata') ||
      text.includes('guarnicion') ||
      text.includes('guarnición')
    ) {
      return 'starter';
    }

    if (text.includes('ensalada') || text.includes('vegetal') || text.includes('verdura')) {
      return 'salad';
    }

    return 'neutral';
  }
}
