import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoriesRepository.find({
      order: {
        nombre: 'ASC',
      },
    });
  }

  findActive() {
    return this.categoriesRepository.find({
      where: {
        activo: true,
      },
      order: {
        nombre: 'ASC',
      },
    });
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const nombre = this.normalizeName(createCategoryDto.nombre);

    const category = this.categoriesRepository.create({
      nombre,
    });

    return this.categoriesRepository.save(category);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findById(id);

    if (updateCategoryDto.nombre !== undefined) {
      category.nombre = this.normalizeName(updateCategoryDto.nombre);
    }

    return this.categoriesRepository.save(category);
  }

  async activate(id: number) {
    const category = await this.findById(id);

    category.activo = true;

    return this.categoriesRepository.save(category);
  }

  async deactivate(id: number) {
    const category = await this.findById(id);

    category.activo = false;

    return this.categoriesRepository.save(category);
  }

  private async findById(id: number) {
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
      throw new BadRequestException('El nombre de la categoría es obligatorio');
    }

    return normalizedName;
  }
}
