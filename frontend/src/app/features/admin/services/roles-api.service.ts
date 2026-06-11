import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

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

  private readonly apiUrl = 'http://localhost:3000';

  findAll(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }
}
