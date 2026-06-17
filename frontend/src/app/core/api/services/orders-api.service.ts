import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AddOrderItemRequest,
  CreateOrderRequest,
  Order,
  UpdateOrderDetailStatusRequest,
} from '../../../shared/models/order.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class OrdersApiService {
  private readonly http = inject(HttpClient);

  findOpen(): Observable<Order[]> {
    return this.http.get<Order[]>(`${API_BASE_URL}/orders/open`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  findById(id: number): Observable<Order> {
    return this.http.get<Order>(`${API_BASE_URL}/orders/${id}`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  create(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders`, order);
  }

  addItem(orderId: number, item: AddOrderItemRequest): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/${orderId}/items`, item);
  }

  sendToKitchen(orderId: number): Observable<Order> {
    return this.http.post<Order>(`${API_BASE_URL}/orders/${orderId}/send-to-kitchen`, {});
  }

  close(orderId: number): Observable<Order> {
    return this.http.patch<Order>(`${API_BASE_URL}/orders/${orderId}/close`, {});
  }

  cancel(orderId: number): Observable<Order> {
    return this.http.patch<Order>(`${API_BASE_URL}/orders/${orderId}/cancel`, {});
  }

  updateDetailStatus(
    orderId: number,
    detailId: number,
    status: UpdateOrderDetailStatusRequest,
  ): Observable<Order> {
    return this.http.patch<Order>(
      `${API_BASE_URL}/orders/${orderId}/items/${detailId}/status`,
      status,
    );
  }
}
