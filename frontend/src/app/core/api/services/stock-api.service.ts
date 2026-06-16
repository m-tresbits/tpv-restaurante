import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import { DailyStock, UpsertDailyStockRequest } from '../../../shared/models/stock.model';

@Injectable({
  providedIn: 'root',
})
export class StockApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<DailyStock[]> {
    return this.http.get<DailyStock[]>(`${API_BASE_URL}/stock`);
  }

  findByDate(fecha: string): Observable<DailyStock[]> {
    return this.http.get<DailyStock[]>(`${API_BASE_URL}/stock/date/${fecha}`);
  }

  findByProductAndDate(productId: number, fecha: string): Observable<DailyStock> {
    return this.http.get<DailyStock>(`${API_BASE_URL}/stock/product/${productId}/date/${fecha}`);
  }

  upsertDailyStock(stock: UpsertDailyStockRequest): Observable<DailyStock> {
    return this.http.post<DailyStock>(`${API_BASE_URL}/stock/daily`, stock);
  }
}
