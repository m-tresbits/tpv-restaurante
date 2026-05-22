import { Routes } from '@angular/router';

export const WAITER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/waiter-home/waiter-home').then((component) => component.WaiterHome),
  },
];
