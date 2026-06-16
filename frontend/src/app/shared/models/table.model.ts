export type TableStatus = 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA';

export type RestaurantTable = {
  id: number;
  numero: number;
  capacidad: number;
  estado: TableStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateTableRequest = {
  numero: number;
  capacidad: number;
};

export type UpdateTableRequest = Partial<CreateTableRequest>;

export type UpdateTableStatusRequest = {
  estado: TableStatus;
};
