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
import { BranchesService } from './branches.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';

@ApiTags('branches')
@Controller('branches')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva sucursal' })
  @ApiResponse({ status: 201, description: 'Sucursal creada exitosamente' })
  create(@Body() createBranchDto: CreateBranchDto, @GetUserId() userId: number) {
    return this.branchesService.create(createBranchDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las sucursales' })
  @ApiQuery({ name: 'estado', required: false, enum: ['Activa', 'Inactiva'] })
  @ApiResponse({ status: 200, description: 'Lista de sucursales' })
  findAll(@GetUserId() userId: number, @Query('estado') estado?: 'Activa' | 'Inactiva') {
    return this.branchesService.findAll(userId, estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener sucursal por ID' })
  @ApiResponse({ status: 200, description: 'Sucursal encontrada' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.branchesService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar sucursal' })
  @ApiResponse({ status: 200, description: 'Sucursal actualizada' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  update(@Param('id') id: string, @Body() updateBranchDto: UpdateBranchDto, @GetUserId() userId: number) {
    return this.branchesService.update(+id, updateBranchDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar sucursal' })
  @ApiResponse({ status: 200, description: 'Sucursal eliminada' })
  @ApiResponse({ status: 404, description: 'Sucursal no encontrada' })
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.branchesService.remove(+id, userId);
  }
}
