import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';

@ApiTags('sales')
@Controller('sales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva venta' })
  create(@Body() createSaleDto: CreateSaleDto, @GetUserId() userId: number) {
    return this.salesService.create(createSaleDto, userId);
  }

  @Get()
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiOperation({ summary: 'Obtener todas las ventas' })
  findAll(@GetUserId() userId: number, @Query('branchId') branchId?: number | 'all') {
    const branchIdNum = branchId === 'all' ? 'all' : branchId ? +branchId : undefined;
    return this.salesService.findAll(userId, branchIdNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener venta por ID' })
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.salesService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar venta' })
  update(@Param('id') id: string, @Body() updateSaleDto: UpdateSaleDto, @GetUserId() userId: number) {
    return this.salesService.update(+id, updateSaleDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar venta' })
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.salesService.remove(+id, userId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar venta y reestockear productos' })
  @ApiResponse({ status: 200, description: 'Venta cancelada exitosamente' })
  cancel(@Param('id') id: string, @GetUserId() userId: number) {
    return this.salesService.cancelSale(+id, userId);
  }
}
