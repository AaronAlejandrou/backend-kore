import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto en inventario' })
  create(@Body() createInventoryItemDto: CreateInventoryItemDto) {
    return this.inventoryService.create(createInventoryItemDto);
  }

  @Get()
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, SKU, marca, color' })
  @ApiOperation({ summary: 'Obtener todos los productos del inventario' })
  findAll(
    @Query('branchId') branchId?: number | 'all',
    @Query('search') search?: string,
  ) {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.inventoryService.findAll(branchIdNum || branchId, search);
  }

  @Get('low-stock')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiOperation({ summary: 'Obtener productos con stock bajo' })
  getLowStock(@Query('branchId') branchId?: number | 'all') {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.inventoryService.getLowStockItems(branchIdNum || branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto) {
    return this.inventoryService.update(+id, updateInventoryItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto' })
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(+id);
  }
}
