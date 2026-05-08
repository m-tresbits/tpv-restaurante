import { Routes } from '@angular/router';

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
    path: '**',
    redirectTo: 'auth/login',
  },
];
