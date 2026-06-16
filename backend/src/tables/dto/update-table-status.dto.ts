import { IsIn } from 'class-validator';

import type { TableStatus } from '../table.entity';

export class UpdateTableStatusDto {
  @IsIn(['LIBRE', 'OCUPADA', 'RESERVADA', 'INACTIVA'])
  estado!: TableStatus;
}
