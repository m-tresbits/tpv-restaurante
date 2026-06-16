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

@Entity('stock_diario')
export class DailyStock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ name: 'cantidad_inicial', type: 'integer' })
  cantidadInicial!: number;

  @Column({ name: 'cantidad_disponible', type: 'integer' })
  cantidadDisponible!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'producto_id' })
  product!: Product;
}
