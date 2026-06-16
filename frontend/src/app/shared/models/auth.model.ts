export type AuthRole = 'ADMIN' | 'CAMARERO' | 'COCINA';

export type AuthUser = {
  id: number;
  nombre: string;
  rol: AuthRole;
};

export type LoginRequest = {
  nombre: string;
  pin: string;
};

export type LoginResponse = {
  accessToken: string;
  usuario: AuthUser;
};
