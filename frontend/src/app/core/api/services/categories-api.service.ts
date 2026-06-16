import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../shared/models/category.model';
import { API_BASE_URL } from '../api.config';

@Injectable({
  providedIn: 'root',
})
export class CategoriesApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories`);
  }

  findActive(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_BASE_URL}/categories/active`);
  }

  create(category: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${API_BASE_URL}/categories`, category);
  }

  update(id: number, category: UpdateCategoryRequest): Observable<Category> {
    return this.http.patch<Category>(`${API_BASE_URL}/categories/${id}`, category);
  }

  deactivate(id: number): Observable<Category> {
    return this.http.patch<Category>(`${API_BASE_URL}/categories/${id}/deactivate`, {});
  }

  activate(id: number): Observable<Category> {
    return this.http.patch<Category>(`${API_BASE_URL}/categories/${id}/activate`, {});
  }
}
