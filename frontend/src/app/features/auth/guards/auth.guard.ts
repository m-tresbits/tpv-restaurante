import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

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

  const expectedRole = route.data['role'];
  const currentRole = authSessionService.getRole();

  if (!authSessionService.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  if (currentRole === expectedRole) {
    return true;
  }

  return router.createUrlTree([getRouteByRole(currentRole)]);
};

function getRouteByRole(role: string | null): string {
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
