import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpsertDailyStockDto } from './dto/upsert-daily-stock.dto';
import { StockService } from './stock.service';

@Controller('stock')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.stockService.findAll();
  }

  @Get('date/:fecha')
  @Roles('ADMIN', 'CAMARERO', 'COCINA')
  findByDate(@Param('fecha') fecha: string) {
    return this.stockService.findByDate(fecha);
  }

  @Get('product/:productId/date/:fecha')
  @Roles('ADMIN', 'CAMARERO', 'COCINA')
  findByProductAndDate(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('fecha') fecha: string,
  ) {
    return this.stockService.findByProductAndDate(productId, fecha);
  }

  @Post('daily')
  @Roles('ADMIN')
  upsertDailyStock(@Body() upsertDailyStockDto: UpsertDailyStockDto) {
    return this.stockService.upsertDailyStock(upsertDailyStockDto);
  }
}
