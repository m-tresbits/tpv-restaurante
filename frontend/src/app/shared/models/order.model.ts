import { Product } from './product.model';
import { RestaurantTable } from './table.model';

export type OrderStatus = 'ABIERTO' | 'EN_COCINA' | 'SERVIDO' | 'CERRADO' | 'CANCELADO';

export type OrderDetailStatus = 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'SERVIDO' | 'CANCELADO';

export type OrderDetail = {
  id: number;
  product: Omit<Product, 'category'> & { category?: Product['category'] };
  cantidad: number;
  precioUnitario: string;
  estado: OrderDetailStatus;
  observaciones: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Order = {
  id: number;
  table: RestaurantTable;
  estado: OrderStatus;
  fechaCreacion: string;
  fechaEnvioCocina?: string | null;
  fechaCierre: string | null;
  total: string;
  details: OrderDetail[];
  updatedAt: string;
};

export type CreateOrderRequest = {
  mesaId: number;
};

export type AddOrderItemRequest = {
  productoId: number;
  cantidad: number;
  observaciones?: string;
};

export type UpdateOrderDetailStatusRequest = {
  estado: OrderDetailStatus;
};

export type UpdateOrderItemQuantityRequest = {
  cantidad: number;
};
