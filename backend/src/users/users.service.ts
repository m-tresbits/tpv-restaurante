import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: {
        role: true,
      },
      order: {
        id: 'ASC',
      },
    });
  }

  findActiveByName(nombre: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.pinHash')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.nombre = :nombre', { nombre })
      .andWhere('user.activo = :activo', { activo: true })
      .getOne();
  }

  async updateLastAccess(userId: number): Promise<void> {
    await this.usersRepository.update(userId, {
      ultimoAcceso: new Date(),
    });
  }
}
