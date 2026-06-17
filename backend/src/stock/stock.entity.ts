import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Product } from '../products/product.entity';

@Entity('stock')
@Index(['product'], { unique: true })
export class ProductStock {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  cantidad!: number;

  @Column({ name: 'producto_id', type: 'integer' })
  productoId!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'producto_id' })
  product!: Product;
}
