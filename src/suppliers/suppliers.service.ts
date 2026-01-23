import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Supplier } from '../entities/supplier.entity';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) { }

  async create(createSupplierDto: CreateSupplierDto, userId: number): Promise<Supplier> {
    const supplier = this.supplierRepository.create({
      ...createSupplierDto,
      userId,
    });
    return this.supplierRepository.save(supplier);
  }

  async findAll(userId: number, search?: string): Promise<Supplier[]> {
    if (search) {
      return this.supplierRepository.find({
        where: [
          { userId, nombre: Like(`%${search}%`) },
          { userId, empresa: Like(`%${search}%`) },
        ],
      });
    }
    return this.supplierRepository.find({ where: { userId } });
  }

  async findOne(id: number, userId: number): Promise<Supplier> {
    const supplier = await this.supplierRepository.findOne({ where: { id, userId } });
    if (!supplier) {
      throw new NotFoundException(`Proveedor con ID ${id} no encontrado`);
    }
    return supplier;
  }

  async update(id: number, updateSupplierDto: UpdateSupplierDto, userId: number): Promise<Supplier> {
    const supplier = await this.findOne(id, userId);
    Object.assign(supplier, updateSupplierDto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: number, userId: number): Promise<void> {
    const supplier = await this.findOne(id, userId);
    await this.supplierRepository.remove(supplier);
  }
}
