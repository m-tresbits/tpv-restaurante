import type { OrderDetail } from './order-detail.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { RestaurantTable } from '../tables/table.entity';
import { User } from '../users/user.entity';

export type OrderStatus =
  | 'ABIERTO'
  | 'EN_COCINA'
  | 'SERVIDO'
  | 'CERRADO'
  | 'CANCELADO';

@Entity('pedidos')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 30, default: 'ABIERTO' })
  estado!: OrderStatus;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamptz' })
  fechaCreacion!: Date;

  @Column({ name: 'fecha_cierre', type: 'timestamptz', nullable: true })
  fechaCierre!: Date | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
  total!: string;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => RestaurantTable)
  @JoinColumn({ name: 'mesa_id' })
  table!: RestaurantTable;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'usuario_id' })
  user!: User;

  @OneToMany('OrderDetail', 'order')
  details!: OrderDetail[];
}
