import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';

import { Product } from '../products/product.entity';
import { ProductStock } from '../stock/stock.entity';
import { RestaurantTable } from '../tables/table.entity';
import { User } from '../users/user.entity';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDetailStatusDto } from './dto/update-order-detail-status.dto';
import { UpdateOrderItemQuantityDto } from './dto/update-order-item-quantity.dto';
import { OrderDetail } from './order-detail.entity';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  private readonly activeOrderStatuses = [
    'ABIERTO',
    'EN_COCINA',
    'SERVIDO',
  ] as const;

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
    private readonly dataSource: DataSource,
  ) {}

  findOpen() {
    return this.ordersRepository.find({
      where: {
        estado: In(this.activeOrderStatuses),
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
        estado: In(this.activeOrderStatuses),
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

    if (order.estado !== 'ABIERTO' && order.estado !== 'EN_COCINA') {
      throw new BadRequestException(
        'Solo se pueden añadir productos a pedidos abiertos o enviados a cocina',
      );
    }

    const product = await this.findProductById(addOrderItemDto.productoId);

    if (!product.activo || !product.category.activo) {
      throw new BadRequestException('El producto no está disponible');
    }

    const quantity = this.normalizeQuantity(addOrderItemDto.cantidad);

    await this.dataSource.transaction(async (manager) => {
      const stockRepository = manager.getRepository(ProductStock);
      const orderDetailsRepository = manager.getRepository(OrderDetail);
      const ordersRepository = manager.getRepository(Order);

      const stock = await stockRepository.findOne({
        where: {
          productoId: product.id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!stock) {
        throw new BadRequestException(
          'No hay stock configurado para este producto',
        );
      }

      if (stock.cantidad < quantity) {
        throw new BadRequestException(
          'No hay stock suficiente para este producto',
        );
      }

      stock.cantidad -= quantity;
      await stockRepository.save(stock);

      const detail = orderDetailsRepository.create({
        order: {
          id: order.id,
        } as Order,
        product: {
          id: product.id,
        } as Product,
        cantidad: quantity,
        precioUnitario: product.precio,
        estado: 'PENDIENTE',
        observaciones: this.normalizeObservations(
          addOrderItemDto.observaciones,
        ),
      });

      await orderDetailsRepository.save(detail);

      const details = await orderDetailsRepository.find({
        where: {
          order: {
            id: order.id,
          },
        },
      });

      const total = this.calculateTotal(details);

      await ordersRepository.update(order.id, {
        total,
      });
    });

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

  async removeItem(orderId: number, detailId: number) {
    const order = await this.findOne(orderId);

    this.ensureEditableOrder(order);

    await this.dataSource.transaction(async (manager) => {
      const stockRepository = manager.getRepository(ProductStock);
      const orderDetailsRepository = manager.getRepository(OrderDetail);
      const ordersRepository = manager.getRepository(Order);

      const detail = await orderDetailsRepository.findOne({
        where: {
          id: detailId,
          order: {
            id: order.id,
          },
        },
        relations: {
          product: true,
        },
      });

      if (!detail) {
        throw new NotFoundException('Línea de pedido no encontrada');
      }

      const stock = await stockRepository.findOne({
        where: {
          productoId: detail.product.id,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (stock) {
        stock.cantidad += detail.cantidad;
        await stockRepository.save(stock);
      }

      await orderDetailsRepository.remove(detail);
      await this.recalculateOrderTotal(
        order.id,
        orderDetailsRepository,
        ordersRepository,
      );
    });

    return this.findOne(order.id);
  }

  async updateItemQuantity(
    orderId: number,
    detailId: number,
    updateOrderItemQuantityDto: UpdateOrderItemQuantityDto,
  ) {
    const order = await this.findOne(orderId);

    this.ensureEditableOrder(order);

    const newQuantity = this.normalizeQuantity(
      updateOrderItemQuantityDto.cantidad,
    );

    await this.dataSource.transaction(async (manager) => {
      const stockRepository = manager.getRepository(ProductStock);
      const orderDetailsRepository = manager.getRepository(OrderDetail);
      const ordersRepository = manager.getRepository(Order);

      const detail = await orderDetailsRepository.findOne({
        where: {
          id: detailId,
          order: {
            id: order.id,
          },
        },
        relations: {
          product: true,
        },
      });

      if (!detail) {
        throw new NotFoundException('Línea de pedido no encontrada');
      }

      const quantityDifference = newQuantity - detail.cantidad;

      if (quantityDifference !== 0) {
        const stock = await stockRepository.findOne({
          where: {
            productoId: detail.product.id,
          },
          lock: {
            mode: 'pessimistic_write',
          },
        });

        if (!stock) {
          throw new BadRequestException(
            'No hay stock configurado para este producto',
          );
        }

        if (quantityDifference > 0 && stock.cantidad < quantityDifference) {
          throw new BadRequestException(
            'No hay stock suficiente para este producto',
          );
        }

        stock.cantidad -= quantityDifference;
        await stockRepository.save(stock);

        detail.cantidad = newQuantity;
        await orderDetailsRepository.save(detail);
        await this.recalculateOrderTotal(
          order.id,
          orderDetailsRepository,
          ordersRepository,
        );
      }
    });

    return this.findOne(order.id);
  }

  async updateDetailStatus(
    orderId: number,
    detailId: number,
    updateOrderDetailStatusDto: UpdateOrderDetailStatusDto,
  ) {
    const order = await this.findOne(orderId);

    if (order.estado === 'CERRADO' || order.estado === 'CANCELADO') {
      throw new BadRequestException(
        'No se puede modificar un pedido cerrado o cancelado',
      );
    }

    const detail = await this.orderDetailsRepository.findOne({
      where: {
        id: detailId,
        order: {
          id: orderId,
        },
      },
      relations: {
        product: true,
      },
    });

    if (!detail) {
      throw new NotFoundException('Línea de pedido no encontrada');
    }

    if (
      updateOrderDetailStatusDto.estado === 'EN_PREPARACION' ||
      updateOrderDetailStatusDto.estado === 'LISTO'
    ) {
      if (order.estado !== 'EN_COCINA') {
        throw new BadRequestException(
          'Solo se pueden preparar productos de pedidos enviados a cocina',
        );
      }
    }

    detail.estado = updateOrderDetailStatusDto.estado;

    await this.orderDetailsRepository.save(detail);

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

    await this.dataSource.transaction(async (manager) => {
      const stockRepository = manager.getRepository(ProductStock);
      const orderDetailsRepository = manager.getRepository(OrderDetail);
      const ordersRepository = manager.getRepository(Order);
      const tablesRepository = manager.getRepository(RestaurantTable);

      order.estado = 'CANCELADO';
      order.fechaCierre = new Date();

      await ordersRepository.save(order);

      const details = await orderDetailsRepository.find({
        where: {
          order: {
            id: order.id,
          },
        },
        relations: {
          product: true,
        },
      });

      for (const detail of details) {
        if (detail.estado !== 'CANCELADO') {
          const stock = await stockRepository.findOne({
            where: {
              productoId: detail.product.id,
            },
            lock: {
              mode: 'pessimistic_write',
            },
          });

          if (stock) {
            stock.cantidad += detail.cantidad;

            await stockRepository.save(stock);
          }
        }

        detail.estado = 'CANCELADO';
        await orderDetailsRepository.save(detail);
      }

      order.table.estado = 'LIBRE';
      await tablesRepository.save(order.table);
    });

    return this.findOne(order.id);
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

  private calculateTotal(details: OrderDetail[]): string {
    const total = details.reduce<number>((accumulator, detail) => {
      return accumulator + Number(detail.precioUnitario) * detail.cantidad;
    }, 0);

    return total.toFixed(2);
  }

  private ensureEditableOrder(order: Order): void {
    if (order.estado !== 'ABIERTO') {
      throw new BadRequestException(
        'Solo se pueden editar líneas de pedidos abiertos. El pedido ya está en cocina o finalizado.',
      );
    }
  }

  private async recalculateOrderTotal(
    orderId: number,
    orderDetailsRepository: Repository<OrderDetail>,
    ordersRepository: Repository<Order>,
  ): Promise<void> {
    const details = await orderDetailsRepository.find({
      where: {
        order: {
          id: orderId,
        },
      },
    });

    await ordersRepository.update(orderId, {
      total: this.calculateTotal(details),
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
