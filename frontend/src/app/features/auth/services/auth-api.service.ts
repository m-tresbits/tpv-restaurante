import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../../core/api/api.config';

export type AuthRole = 'ADMIN' | 'CAMARERO' | 'COCINA';

export type LoginRequest = {
  nombre: string;
  pin: string;
};

export type LoginResponse = {
  accessToken: string;
  usuario: {
    id: number;
    nombre: string;
    rol: AuthRole;
  };
};

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_BASE_URL}/auth/login`, credentials);
  }
}
