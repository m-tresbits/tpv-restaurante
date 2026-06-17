import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ProductStock } from './stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(ProductStock)
    private readonly stockRepository: Repository<ProductStock>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll() {
    return this.stockRepository.find({
      relations: {
        product: {
          category: true,
        },
      },
      order: {
        product: {
          nombre: 'ASC',
        },
      },
    });
  }

  async findByProduct(productId: number) {
    const stock = await this.stockRepository.findOne({
      where: {
        productoId: productId,
      },
      relations: {
        product: {
          category: true,
        },
      },
    });

    if (!stock) {
      throw new NotFoundException('Stock no encontrado');
    }

    return stock;
  }

  async update(productId: number, updateStockDto: UpdateStockDto) {
    const product = await this.findProductById(productId);
    const cantidad = this.normalizeQuantity(updateStockDto.cantidad);

    if (!product.activo) {
      throw new BadRequestException(
        'No se puede gestionar stock de un producto inactivo',
      );
    }

    const stock = await this.stockRepository.findOne({
      where: {
        productoId: product.id,
      },
    });

    if (stock) {
      stock.cantidad = cantidad;
      await this.stockRepository.save(stock);

      return this.findByProduct(product.id);
    }

    const newStock = this.stockRepository.create({
      product,
      cantidad,
    });

    await this.stockRepository.save(newStock);

    return this.findByProduct(product.id);
  }

  private async findProductById(id: number) {
    const product = await this.productsRepository.findOne({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  private normalizeQuantity(cantidad: number) {
    if (!Number.isInteger(cantidad) || cantidad < 0) {
      throw new BadRequestException(
        'La cantidad de stock no puede ser negativa',
      );
    }

    return cantidad;
  }
}
