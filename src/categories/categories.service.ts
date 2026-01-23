import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  async create(createCategoryDto: CreateCategoryDto, userId: number): Promise<Category> {
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
