import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class AddOrderItemDto {
  @IsInt()
  @Min(1)
  productoId!: number;

  @IsInt()
  @Min(1)
  cantidad!: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  observaciones?: string | null;
}
