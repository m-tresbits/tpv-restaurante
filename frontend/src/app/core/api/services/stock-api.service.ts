import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { DailyStock, UpsertDailyStockRequest } from '../../../shared/models/stock.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class StockApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<DailyStock[]> {
    return this.http.get<DailyStock[]>(`${API_BASE_URL}/stock`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  findByDate(fecha: string): Observable<DailyStock[]> {
    return this.http.get<DailyStock[]>(`${API_BASE_URL}/stock/date/${fecha}`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  findByProductAndDate(productId: number, fecha: string): Observable<DailyStock> {
    return this.http.get<DailyStock>(`${API_BASE_URL}/stock/product/${productId}/date/${fecha}`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  upsertDailyStock(stock: UpsertDailyStockRequest): Observable<DailyStock> {
    return this.http.post<DailyStock>(`${API_BASE_URL}/stock/daily`, stock);
  }
}
