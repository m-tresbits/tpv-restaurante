import { Routes } from '@angular/router';

import { AuthLayout } from '../../layouts/auth-layout/auth-layout';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
      },
      {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then((component) => component.Login),
      },
    ],
  },
];
