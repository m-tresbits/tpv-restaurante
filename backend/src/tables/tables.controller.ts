import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableStatusDto } from './dto/update-table-status.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { TablesService } from './tables.service';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  @Roles('ADMIN')
  findAll() {
    return this.tablesService.findAll();
  }

  @Get('active')
  @Roles('ADMIN', 'CAMARERO')
  findActive() {
    return this.tablesService.findActive();
  }

  @Get(':id')
  @Roles('ADMIN', 'CAMARERO')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tablesService.findOne(id);
  }

  @Post()
  @Roles('ADMIN')
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto);
  }

  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTableDto: UpdateTableDto,
  ) {
    return this.tablesService.update(id, updateTableDto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'CAMARERO')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTableStatusDto: UpdateTableStatusDto,
  ) {
    return this.tablesService.updateStatus(id, updateTableStatusDto);
  }
}
