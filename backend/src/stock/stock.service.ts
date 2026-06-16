import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import { UpsertDailyStockDto } from './dto/upsert-daily-stock.dto';
import { DailyStock } from './stock.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(DailyStock)
    private readonly stockRepository: Repository<DailyStock>,
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
        fecha: 'DESC',
        id: 'ASC',
      },
    });
  }

  findByDate(fecha: string) {
    const normalizedDate = this.normalizeDate(fecha);

    return this.stockRepository.find({
      where: {
        fecha: normalizedDate,
      },
      relations: {
        product: {
          category: true,
        },
      },
      order: {
        id: 'ASC',
      },
    });
  }

  async findByProductAndDate(productId: number, fecha: string) {
    const normalizedDate = this.normalizeDate(fecha);

    const stock = await this.stockRepository.findOne({
      where: {
        product: {
          id: productId,
        },
        fecha: normalizedDate,
      },
      relations: {
        product: {
          category: true,
        },
      },
    });

    if (!stock) {
      throw new NotFoundException('Stock diario no encontrado');
    }

    return stock;
  }

  async upsertDailyStock(upsertDailyStockDto: UpsertDailyStockDto) {
    const fecha = this.normalizeDate(upsertDailyStockDto.fecha);
    const product = await this.findProductById(upsertDailyStockDto.productoId);

    if (!product.activo) {
      throw new BadRequestException(
        'No se puede gestionar stock de un producto inactivo',
      );
    }

    const existingStock = await this.stockRepository.findOne({
      where: {
        product: {
          id: product.id,
        },
        fecha,
      },
      relations: {
        product: true,
      },
    });

    if (existingStock) {
      existingStock.cantidadInicial = upsertDailyStockDto.cantidadInicial;
      existingStock.cantidadDisponible = upsertDailyStockDto.cantidadInicial;

      await this.stockRepository.save(existingStock);

      return this.findByProductAndDate(product.id, fecha);
    }

    const stock = this.stockRepository.create({
      product,
      fecha,
      cantidadInicial: upsertDailyStockDto.cantidadInicial,
      cantidadDisponible: upsertDailyStockDto.cantidadInicial,
    });

    const savedStock = await this.stockRepository.save(stock);

    return this.findByProductAndDate(product.id, savedStock.fecha);
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

  private normalizeDate(fecha: string) {
    const normalizedDate = fecha.trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
      throw new BadRequestException('La fecha debe tener formato YYYY-MM-DD');
    }

    return normalizedDate;
  }
}
