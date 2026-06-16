import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';
import {
  CreateTableRequest,
  RestaurantTable,
  UpdateTableRequest,
  UpdateTableStatusRequest,
} from '../../../shared/models/table.model';

@Injectable({
  providedIn: 'root',
})
export class TablesApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${API_BASE_URL}/tables`);
  }

  findActive(): Observable<RestaurantTable[]> {
    return this.http.get<RestaurantTable[]>(`${API_BASE_URL}/tables/active`);
  }

  findById(id: number): Observable<RestaurantTable> {
    return this.http.get<RestaurantTable>(`${API_BASE_URL}/tables/${id}`);
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
