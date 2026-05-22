import { Routes } from '@angular/router';

export const KITCHEN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/kitchen-home/kitchen-home').then((component) => component.KitchenHome),
  },
];
