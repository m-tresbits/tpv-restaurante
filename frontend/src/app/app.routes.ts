import { Routes } from '@angular/router';
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
    children: [
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.routes').then((routes) => routes.ADMIN_ROUTES),
      },
      {
        path: 'waiter',
        loadChildren: () =>
          import('./features/waiter/waiter.routes').then((routes) => routes.WAITER_ROUTES),
      },
      {
        path: 'kitchen',
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
