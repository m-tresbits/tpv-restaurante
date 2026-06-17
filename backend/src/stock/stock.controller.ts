import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateStockDto } from './dto/update-stock.dto';
import { ProductStock } from './stock.entity';
import { StockService } from './stock.service';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @Roles('ADMIN', 'CAMARERO', 'COCINA')
  findAll(): Promise<ProductStock[]> {
    return this.stockService.findAll();
  }

  @Patch(':productId')
  @Roles('ADMIN')
  update(
    @Param('productId', ParseIntPipe) productId: number,
    @Body() updateStockDto: UpdateStockDto,
  ): Promise<ProductStock> {
    return this.stockService.update(productId, updateStockDto);
  }
}
