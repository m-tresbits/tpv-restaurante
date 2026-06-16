export type Category = {
  id: number;
  nombre: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryRequest = {
  nombre: string;
};

export type UpdateCategoryRequest = Partial<CreateCategoryRequest>;
