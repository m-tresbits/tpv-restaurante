import { Category } from './category.model';

export type Product = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: string;
  activo: boolean;
  category: Category;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductRequest = {
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId: number;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;
