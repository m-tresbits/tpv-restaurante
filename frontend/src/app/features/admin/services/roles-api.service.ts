import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';

export type Role = {
  id: number;
  nombre: 'ADMIN' | 'CAMARERO' | 'COCINA';
  createdAt: string;
  updatedAt: string;
};

@Injectable({
  providedIn: 'root',
})
export class RolesApiService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${API_BASE_URL}/roles`);
  }
}
