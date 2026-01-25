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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';

@ApiTags('categories')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nueva categoría' })
  create(@Body() createCategoryDto: CreateCategoryDto, @GetUserId() userId: number) {
    return this.categoriesService.create(createCategoryDto, userId);
  }

  @Post('find-or-create')
  @ApiOperation({ summary: 'Buscar categoría por nombre o crearla si no existe' })
  async findOrCreate(@Body() body: { nombre: string }, @GetUserId() userId: number) {
    return this.categoriesService.findOrCreate(body.nombre, userId);
  }

  @Get()
  @ApiQuery({ name: 'estado', required: false, enum: ['Activa', 'Inactiva'] })
  @ApiOperation({ summary: 'Obtener todas las categorías' })
  findAll(@GetUserId() userId: number, @Query('estado') estado?: 'Activa' | 'Inactiva') {
    return this.categoriesService.findAll(userId, estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.categoriesService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar categoría' })
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto, @GetUserId() userId: number) {
    return this.categoriesService.update(+id, updateCategoryDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar categoría' })
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.categoriesService.remove(+id, userId);
  }
}
