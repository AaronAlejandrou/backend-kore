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
import { InventoryService, BulkImportItemDto, ImportResult } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';
import { CategoriesService } from '../categories/categories.service';

@ApiTags('inventory')
@Controller('inventory')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly categoriesService: CategoriesService,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo producto en inventario' })
  create(@Body() createInventoryItemDto: CreateInventoryItemDto, @GetUserId() userId: number) {
    return this.inventoryService.create(createInventoryItemDto, userId);
  }

  @Post('bulk-import')
  @ApiOperation({ summary: 'Importar múltiples productos de forma transaccional' })
  async bulkImport(
    @Body() body: { items: BulkImportItemDto[] },
    @GetUserId() userId: number,
  ): Promise<ImportResult> {
    const categoryResolver = async (nombre: string) => {
      const result = await this.categoriesService.findOrCreate(nombre, userId);
      return { id: result.category.id, created: result.created, nombre: result.category.nombre };
    };

    return this.inventoryService.bulkImport(body.items, userId, categoryResolver);
  }

  @Get()
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, SKU, marca, color' })
  @ApiOperation({ summary: 'Obtener todos los productos del inventario' })
  findAll(
    @GetUserId() userId: number,
    @Query('branchId') branchId?: number | 'all',
    @Query('search') search?: string,
  ) {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.inventoryService.findAll(userId, branchIdNum || branchId, search);
  }

  @Get('low-stock')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiOperation({ summary: 'Obtener productos con stock bajo' })
  getLowStock(@GetUserId() userId: number, @Query('branchId') branchId?: number | 'all') {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.inventoryService.getLowStockItems(userId, branchIdNum || branchId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.inventoryService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar producto' })
  update(@Param('id') id: string, @Body() updateInventoryItemDto: UpdateInventoryItemDto, @GetUserId() userId: number) {
    return this.inventoryService.update(+id, updateInventoryItemDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar producto' })
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.inventoryService.remove(+id, userId);
  }
}
