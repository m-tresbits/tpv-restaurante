import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type TableStatus = 'LIBRE' | 'OCUPADA' | 'RESERVADA' | 'INACTIVA';

@Entity('mesas')
export class RestaurantTable {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', unique: true })
  numero!: number;

  @Column({ type: 'integer', default: 4 })
  capacidad!: number;

  @Column({ type: 'varchar', length: 30, default: 'LIBRE' })
  estado!: TableStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
