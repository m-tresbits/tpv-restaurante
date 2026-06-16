import { IsInt, IsOptional, Min } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @Min(1)
  numero!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacidad?: number;
}
