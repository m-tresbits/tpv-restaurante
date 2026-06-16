import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

type AuthenticatedUser = {
  sub: number;
  nombre: string;
  rol: string;
};

type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('open')
  @Roles('ADMIN', 'CAMARERO', 'COCINA')
  findOpen() {
    return this.ordersService.findOpen();
  }

  @Get(':id')
  @Roles('ADMIN', 'CAMARERO', 'COCINA')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Post()
  @Roles('CAMARERO')
  create(
    @Req() request: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.create(request.user.sub, createOrderDto);
  }

  @Post(':id/items')
  @Roles('CAMARERO')
  addItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() addOrderItemDto: AddOrderItemDto,
  ) {
    return this.ordersService.addItem(id, addOrderItemDto);
  }

  @Post(':id/send-to-kitchen')
  @Roles('CAMARERO')
  sendToKitchen(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.sendToKitchen(id);
  }

  @Patch(':id/close')
  @Roles('CAMARERO')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.close(id);
  }

  @Patch(':id/cancel')
  @Roles('ADMIN', 'CAMARERO')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancel(id);
  }
}
