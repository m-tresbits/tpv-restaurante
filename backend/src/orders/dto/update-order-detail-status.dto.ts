import { IsIn } from 'class-validator';

export type UpdatableOrderDetailStatus =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'SERVIDO';

export class UpdateOrderDetailStatusDto {
  @IsIn(['PENDIENTE', 'EN_PREPARACION', 'LISTO', 'SERVIDO'])
  estado!: UpdatableOrderDetailStatus;
}
