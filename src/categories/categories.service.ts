import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  /**
   * Buscar una categoría por nombre (case-insensitive)
   */
  async findByName(nombre: string, userId: number): Promise<Category | null> {
    return this.categoryRepository
      .createQueryBuilder('category')
      .where('category.userId = :userId', { userId })
      .andWhere('LOWER(category.nombre) = LOWER(:nombre)', { nombre: nombre.trim() })
      .getOne();
  }

  /**
   * Buscar o crear una categoría por nombre
   * Retorna la existente si ya existe, o crea una nueva
   */
  async findOrCreate(nombre: string, userId: number): Promise<{ category: Category; created: boolean }> {
    const existing = await this.findByName(nombre, userId);
    if (existing) {
      return { category: existing, created: false };
    }
    
    const category = this.categoryRepository.create({
      nombre: nombre.trim(),
      descripcion: '',
      estado: 'Activa',
      userId,
    });
    const saved = await this.categoryRepository.save(category);
    return { category: saved, created: true };
  }

  async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<Category> {
    // Verificar si ya existe una categoría con el mismo nombre
    const existing = await this.findByName(createCategoryDto.nombre, userId);
    if (existing) {
      throw new BadRequestException(`Ya existe una categoría con el nombre "${createCategoryDto.nombre}"`);
    }

    const category = this.categoryRepository.create({
      ...createCategoryDto,
      userId,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(userId: number, estado?: 'Activa' | 'Inactiva'): Promise<Category[]> {
    const where: any = { userId };
    if (estado) {
      where.estado = estado;
    }
    return this.categoryRepository.find({ where });
  }

  async findOne(id: number, userId: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id, userId } });
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, userId: number): Promise<Category> {
    const category = await this.findOne(id, userId);
    Object.assign(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: number, userId: number): Promise<void> {
    const category = await this.findOne(id, userId);
    await this.categoryRepository.remove(category);
  }
}
