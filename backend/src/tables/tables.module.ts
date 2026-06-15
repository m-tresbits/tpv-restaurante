import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RestaurantTable } from './table.entity';
import { TablesController } from './tables.controller';
import { TablesService } from './tables.service';

@Module({
  imports: [TypeOrmModule.forFeature([RestaurantTable])],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
