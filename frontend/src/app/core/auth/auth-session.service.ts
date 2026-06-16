import { Injectable, signal } from '@angular/core';

import { AuthRole, AuthUser, LoginResponse } from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthSessionService {
  private readonly tokenKey = 'accessToken';
  private readonly userKey = 'authUser';

  readonly currentUser = signal<AuthUser | null>(this.getStoredUser());

  saveSession(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.accessToken);
    localStorage.setItem(this.userKey, JSON.stringify(response.usuario));

    this.currentUser.set(response.usuario);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getUser(): AuthUser | null {
    return this.currentUser();
  }

  getRole(): AuthRole | null {
    return this.currentUser()?.rol ?? null;
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null && this.currentUser() !== null;
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    this.currentUser.set(null);
  }

  private getStoredUser(): AuthUser | null {
    const storedUser = localStorage.getItem(this.userKey);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }
}
