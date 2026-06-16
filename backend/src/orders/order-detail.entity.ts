import type { Order } from './order.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from '../products/product.entity';

export type OrderDetailStatus =
  | 'PENDIENTE'
  | 'EN_PREPARACION'
  | 'LISTO'
  | 'SERVIDO'
  | 'CANCELADO';

@Entity('detalle_pedido')
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({ name: 'precio_unitario', type: 'numeric', precision: 10, scale: 2 })
  precioUnitario!: string;

  @Column({ type: 'varchar', length: 30, default: 'PENDIENTE' })
  estado!: OrderDetailStatus;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observaciones!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne('Order', 'details')
  @JoinColumn({ name: 'pedido_id' })
  order!: Order;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'producto_id' })
  product!: Product;
}
