export class CreateProductDto {
  nombre!: string;
  descripcion?: string | null;
  precio!: number;
  categoriaId!: number;
}
