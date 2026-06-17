import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ProductStock, UpdateStockRequest } from '../../../shared/models/stock.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class StockApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<ProductStock[]> {
    return this.http.get<ProductStock[]>(`${API_BASE_URL}/stock`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  update(productId: number, stock: UpdateStockRequest): Observable<ProductStock> {
    return this.http.patch<ProductStock>(`${API_BASE_URL}/stock/${productId}`, stock);
  }
}
