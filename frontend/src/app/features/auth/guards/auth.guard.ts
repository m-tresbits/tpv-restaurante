import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthRole } from '../services/auth-api.service';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authSessionService = inject(AuthSessionService);

  if (authSessionService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login']);
};

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authSessionService = inject(AuthSessionService);

  if (!authSessionService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const expectedRole = route.data['role'] as AuthRole;
  const currentRole = authSessionService.getRole();

  if (currentRole === expectedRole) {
    return true;
  }

  return router.createUrlTree([getRouteByRole(currentRole)]);
};

export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authSessionService = inject(AuthSessionService);

  if (!authSessionService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree([getRouteByRole(authSessionService.getRole())]);
};

function getRouteByRole(role: AuthRole | null): string {
  if (role === 'ADMIN') {
    return '/admin';
  }

  if (role === 'CAMARERO') {
    return '/waiter';
  }

  if (role === 'COCINA') {
    return '/kitchen';
  }

  return '/auth/login';
}
