import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from '../categories/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.productsRepository.find({
      relations: {
        category: true,
      },
      order: {
        nombre: 'ASC',
      },
    });
  }

  findAvailable() {
    return this.productsRepository.find({
      where: {
        activo: true,
        category: {
          activo: true,
        },
      },
      relations: {
        category: true,
      },
      order: {
        nombre: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      where: {
        id,
      },
      relations: {
        category: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const category = await this.findCategoryById(createProductDto.categoriaId);

    const product = this.productsRepository.create({
      nombre: this.normalizeName(createProductDto.nombre),
      descripcion: this.normalizeDescription(createProductDto.descripcion),
      precio: this.normalizePrice(createProductDto.precio),
      category,
    });

    return this.productsRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.nombre !== undefined) {
      product.nombre = this.normalizeName(updateProductDto.nombre);
    }

    if (updateProductDto.descripcion !== undefined) {
      product.descripcion = this.normalizeDescription(
        updateProductDto.descripcion,
      );
    }

    if (updateProductDto.precio !== undefined) {
      product.precio = this.normalizePrice(updateProductDto.precio);
    }

    if (updateProductDto.categoriaId !== undefined) {
      product.category = await this.findCategoryById(
        updateProductDto.categoriaId,
      );
    }

    return this.productsRepository.save(product);
  }

  async activate(id: number) {
    const product = await this.findOne(id);

    product.activo = true;

    return this.productsRepository.save(product);
  }

  async deactivate(id: number) {
    const product = await this.findOne(id);

    product.activo = false;

    return this.productsRepository.save(product);
  }

  private async findCategoryById(id: number) {
    const category = await this.categoriesRepository.findOne({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  private normalizeName(nombre: string) {
    const normalizedName = nombre.trim();

    if (!normalizedName) {
      throw new BadRequestException('El nombre del producto es obligatorio');
    }

    return normalizedName;
  }

  private normalizeDescription(descripcion?: string | null) {
    if (descripcion === undefined || descripcion === null) {
      return null;
    }

    const normalizedDescription = descripcion.trim();

    return normalizedDescription || null;
  }

  private normalizePrice(precio: number) {
    if (precio < 0) {
      throw new BadRequestException('El precio no puede ser negativo');
    }

    return precio.toFixed(2);
  }
}
