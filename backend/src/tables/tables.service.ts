import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { RestaurantTable, TableStatus } from './table.entity';

@Injectable()
export class TablesService {
  private readonly validStatuses: TableStatus[] = [
    'LIBRE',
    'OCUPADA',
    'RESERVADA',
    'INACTIVA',
  ];

  constructor(
    @InjectRepository(RestaurantTable)
    private readonly tablesRepository: Repository<RestaurantTable>,
  ) {}

  findAll() {
    return this.tablesRepository.find({
      order: {
        numero: 'ASC',
      },
    });
  }

  findActive() {
    return this.tablesRepository.find({
      where: {
        estado: Not('INACTIVA'),
      },
      order: {
        numero: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const table = await this.tablesRepository.findOne({
      where: {
        id,
      },
    });

    if (!table) {
      throw new NotFoundException('Mesa no encontrada');
    }

    return table;
  }

  async create(createTableDto: CreateTableDto) {
    const table = this.tablesRepository.create({
      numero: this.normalizeNumber(createTableDto.numero),
      capacidad: this.normalizeCapacity(createTableDto.capacidad ?? 4),
      estado: 'LIBRE',
    });

    return this.tablesRepository.save(table);
  }

  async update(id: number, updateTableDto: UpdateTableDto) {
    const table = await this.findOne(id);

    if (updateTableDto.numero !== undefined) {
      table.numero = this.normalizeNumber(updateTableDto.numero);
    }

    if (updateTableDto.capacidad !== undefined) {
      table.capacidad = this.normalizeCapacity(updateTableDto.capacidad);
    }

    return this.tablesRepository.save(table);
  }

  async updateStatus(id: number, updateTableStatusDto: UpdateTableStatusDto) {
    const table = await this.findOne(id);
    const estado = this.normalizeStatus(updateTableStatusDto.estado);

    table.estado = estado;

    return this.tablesRepository.save(table);
  }

  private normalizeNumber(numero: number) {
    if (!Number.isInteger(numero) || numero <= 0) {
      throw new BadRequestException('El número de mesa debe ser mayor que 0');
    }

    return numero;
  }

  private normalizeCapacity(capacidad: number) {
    if (!Number.isInteger(capacidad) || capacidad <= 0) {
      throw new BadRequestException('La capacidad debe ser mayor que 0');
    }

    return capacidad;
  }

  private normalizeStatus(estado: string) {
    if (!this.validStatuses.includes(estado as TableStatus)) {
      throw new BadRequestException('Estado de mesa no válido');
    }

    return estado as TableStatus;
  }
}
