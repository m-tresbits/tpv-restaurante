import { Product } from './product.model';

export type DailyStock = {
  id: number;
  product: Product;
  fecha: string;
  cantidadInicial: number;
  cantidadDisponible: number;
  createdAt: string;
  updatedAt: string;
};

export type UpsertDailyStockRequest = {
  productoId: number;
  fecha: string;
  cantidadInicial: number;
};
