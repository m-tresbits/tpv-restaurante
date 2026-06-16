import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Product } from '../products/product.entity';
import { DailyStock } from './stock.entity';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

@Module({
  imports: [TypeOrmModule.forFeature([DailyStock, Product])],
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
