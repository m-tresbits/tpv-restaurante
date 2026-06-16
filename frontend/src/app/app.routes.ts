import { Routes } from '@angular/router';

import { authGuard, roleGuard } from './core/auth/guards/auth.guard';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'auth/login',
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((routes) => routes.AUTH_ROUTES),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: {
          role: 'ADMIN',
        },
        loadChildren: () =>
          import('./features/admin/admin.routes').then((routes) => routes.ADMIN_ROUTES),
      },
      {
        path: 'waiter',
        canActivate: [roleGuard],
        data: {
          role: 'CAMARERO',
        },
        loadChildren: () =>
          import('./features/waiter/waiter.routes').then((routes) => routes.WAITER_ROUTES),
      },
      {
        path: 'kitchen',
        canActivate: [roleGuard],
        data: {
          role: 'COCINA',
        },
        loadChildren: () =>
          import('./features/kitchen/kitchen.routes').then((routes) => routes.KITCHEN_ROUTES),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'auth/login',
  },
];
