import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import { RestaurantTable } from '../tables/table.entity';
import { User } from '../users/user.entity';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDetail } from './order-detail.entity';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderDetail)
    private readonly orderDetailsRepository: Repository<OrderDetail>,
    @InjectRepository(RestaurantTable)
    private readonly tablesRepository: Repository<RestaurantTable>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  findOpen() {
    return this.ordersRepository.find({
      where: {
        estado: In(['ABIERTO', 'EN_COCINA']),
      },
      relations: {
        table: true,
        user: true,
        details: {
          product: true,
        },
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: {
        id,
      },
      relations: {
        table: true,
        user: true,
        details: {
          product: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return order;
  }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const table = await this.findTableById(createOrderDto.mesaId);

    if (table.estado === 'INACTIVA') {
      throw new BadRequestException(
        'No se puede abrir un pedido en una mesa inactiva',
      );
    }

    const existingOrder = await this.ordersRepository.findOne({
      where: {
        table: {
          id: table.id,
        },
        estado: In(['ABIERTO', 'EN_COCINA']),
      },
    });

    if (existingOrder) {
      throw new BadRequestException('La mesa ya tiene un pedido abierto');
    }

    const user = await this.findUserById(userId);

    const order = this.ordersRepository.create({
      table,
      user,
      estado: 'ABIERTO',
      total: '0.00',
      fechaCierre: null,
    });

    const savedOrder = await this.ordersRepository.save(order);

    table.estado = 'OCUPADA';
    await this.tablesRepository.save(table);

    return this.findOne(savedOrder.id);
  }

  async addItem(orderId: number, addOrderItemDto: AddOrderItemDto) {
    const order = await this.findOne(orderId);

    if (order.estado !== 'ABIERTO') {
      throw new BadRequestException(
        'Solo se pueden añadir productos a pedidos abiertos',
      );
    }

    const product = await this.findProductById(addOrderItemDto.productoId);

    if (!product.activo || !product.category.activo) {
      throw new BadRequestException('El producto no está disponible');
    }

    const quantity = this.normalizeQuantity(addOrderItemDto.cantidad);

    const detail = this.orderDetailsRepository.create({
      order,
      product,
      cantidad: quantity,
      precioUnitario: product.precio,
      estado: 'PENDIENTE',
      observaciones: this.normalizeObservations(addOrderItemDto.observaciones),
    });

    await this.orderDetailsRepository.save(detail);
    await this.updateTotal(order.id);

    return this.findOne(order.id);
  }

  async sendToKitchen(id: number) {
    const order = await this.findOne(id);

    if (order.estado !== 'ABIERTO') {
      throw new BadRequestException(
        'Solo se pueden enviar a cocina pedidos abiertos',
      );
    }

    const details = await this.findDetailsByOrderId(order.id);

    if (details.length === 0) {
      throw new BadRequestException(
        'No se puede enviar a cocina un pedido sin productos',
      );
    }

    order.estado = 'EN_COCINA';

    await this.ordersRepository.save(order);

    return this.findOne(order.id);
  }

  async close(id: number) {
    const order = await this.findOne(id);

    if (order.estado === 'CERRADO' || order.estado === 'CANCELADO') {
      throw new BadRequestException('El pedido ya está cerrado o cancelado');
    }

    order.estado = 'CERRADO';
    order.fechaCierre = new Date();

    await this.ordersRepository.save(order);

    order.table.estado = 'LIBRE';
    await this.tablesRepository.save(order.table);

    return this.findOne(order.id);
  }

  async cancel(id: number) {
    const order = await this.findOne(id);

    if (order.estado === 'CERRADO' || order.estado === 'CANCELADO') {
      throw new BadRequestException('El pedido ya está cerrado o cancelado');
    }

    order.estado = 'CANCELADO';
    order.fechaCierre = new Date();

    await this.ordersRepository.save(order);

    const details = await this.findDetailsByOrderId(order.id);

    for (const detail of details) {
      detail.estado = 'CANCELADO';
      await this.orderDetailsRepository.save(detail);
    }

    order.table.estado = 'LIBRE';
    await this.tablesRepository.save(order.table);

    return this.findOne(order.id);
  }

  private async updateTotal(orderId: number) {
    const order = await this.findOne(orderId);
    const details = await this.findDetailsByOrderId(order.id);

    const total = details.reduce<number>((accumulator, detail) => {
      return accumulator + Number(detail.precioUnitario) * detail.cantidad;
    }, 0);

    order.total = total.toFixed(2);

    await this.ordersRepository.save(order);
  }

  private async findTableById(id: number) {
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

  private async findProductById(id: number) {
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

  private async findUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return user;
  }

  private findDetailsByOrderId(orderId: number): Promise<OrderDetail[]> {
    return this.orderDetailsRepository.find({
      where: {
        order: {
          id: orderId,
        },
      },
      relations: {
        product: true,
      },
    });
  }

  private normalizeQuantity(quantity: number) {
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new BadRequestException('La cantidad debe ser mayor que 0');
    }

    return quantity;
  }

  private normalizeObservations(observations?: string | null) {
    if (observations === undefined || observations === null) {
      return null;
    }

    const normalizedObservations = observations.trim();

    return normalizedObservations || null;
  }
}
