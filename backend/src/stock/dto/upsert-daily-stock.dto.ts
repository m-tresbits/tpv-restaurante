import { IsDateString, IsInt, Min } from 'class-validator';

export class UpsertDailyStockDto {
  @IsInt()
  @Min(1)
  productoId!: number;

  @IsDateString()
  fecha!: string;

  @IsInt()
  @Min(0)
  cantidadInicial!: number;
}
