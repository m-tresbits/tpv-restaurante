import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  CreateProductRequest,
  Product,
  UpdateProductRequest,
} from '../../../shared/models/product.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/products`);
  }

  findAvailable(): Observable<Product[]> {
    return this.http.get<Product[]>(`${API_BASE_URL}/products/available`);
  }

  findById(id: number): Observable<Product> {
    return this.http.get<Product>(`${API_BASE_URL}/products/${id}`);
  }

  create(product: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${API_BASE_URL}/products`, product);
  }

  update(id: number, product: UpdateProductRequest): Observable<Product> {
    return this.http.patch<Product>(`${API_BASE_URL}/products/${id}`, product);
  }

  deactivate(id: number): Observable<Product> {
    return this.http.patch<Product>(`${API_BASE_URL}/products/${id}/deactivate`, {});
  }

  activate(id: number): Observable<Product> {
    return this.http.patch<Product>(`${API_BASE_URL}/products/${id}/activate`, {});
  }
}
