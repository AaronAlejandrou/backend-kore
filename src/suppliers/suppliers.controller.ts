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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';

@ApiTags('suppliers')
@Controller('suppliers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo proveedor' })
  create(@Body() createSupplierDto: CreateSupplierDto, @GetUserId() userId: number) {
    return this.suppliersService.create(createSupplierDto, userId);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre o empresa' })
  @ApiOperation({ summary: 'Obtener todos los proveedores' })
  findAll(@GetUserId() userId: number, @Query('search') search?: string) {
    return this.suppliersService.findAll(userId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.suppliersService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar proveedor' })
  update(@Param('id') id: string, @Body() updateSupplierDto: UpdateSupplierDto, @GetUserId() userId: number) {
    return this.suppliersService.update(+id, updateSupplierDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar proveedor' })
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.suppliersService.remove(+id, userId);
  }
}
