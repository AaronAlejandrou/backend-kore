import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Branch } from '../entities/branch.entity';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
  ) { }

  async create(createBranchDto: CreateBranchDto, userId: number): Promise<Branch> {
    const branch = this.branchRepository.create({
      ...createBranchDto,
      userId,
    });
    return this.branchRepository.save(branch);
  }

  async findAll(userId: number, estado?: 'Activa' | 'Inactiva'): Promise<Branch[]> {
    const where: any = { userId };
    if (estado) {
      where.estado = estado;
    }
    return this.branchRepository.find({ where });
  }

  async findOne(id: number, userId: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({ where: { id, userId } });
    if (!branch) {
      throw new NotFoundException(`Sucursal con ID ${id} no encontrada`);
    }
    return branch;
  }

  async update(id: number, updateBranchDto: UpdateBranchDto, userId: number): Promise<Branch> {
    const branch = await this.findOne(id, userId);
    Object.assign(branch, updateBranchDto);
    return this.branchRepository.save(branch);
  }

  async remove(id: number, userId: number): Promise<void> {
    const branch = await this.findOne(id, userId);
    await this.branchRepository.remove(branch);
  }
}
