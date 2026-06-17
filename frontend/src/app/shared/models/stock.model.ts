import { Product } from './product.model';

export type ProductStock = {
  id: number;
  product: Product;
  cantidad: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateStockRequest = {
  cantidad: number;
};
