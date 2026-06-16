import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateTableRequest,
  RestaurantTable,
  UpdateTableRequest,
  UpdateTableStatusRequest,
} from '../../../shared/models/table.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class TablesApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${API_BASE_URL}/tables`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  findAvailable(): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${API_BASE_URL}/tables/available`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  findById(id: number): Observable<RestaurantTable> {
    return this.http.get<RestaurantTable>(`${API_BASE_URL}/tables/${id}`, {
      params: {
        t: Date.now().toString(),
      },
    });
  }

  create(table: CreateTableRequest): Observable<RestaurantTable> {
    return this.http.post<RestaurantTable>(`${API_BASE_URL}/tables`, table);
  }

  update(id: number, table: UpdateTableRequest): Observable<RestaurantTable> {
    return this.http.patch<RestaurantTable>(`${API_BASE_URL}/tables/${id}`, table);
  }

  updateStatus(id: number, status: UpdateTableStatusRequest): Observable<RestaurantTable> {
    return this.http.patch<RestaurantTable>(`${API_BASE_URL}/tables/${id}/status`, status);
  }
}
