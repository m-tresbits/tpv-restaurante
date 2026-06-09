import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  private readonly apiUrl = 'http://localhost:3000';

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }
}
