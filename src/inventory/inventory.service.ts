import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
  ) {}

  async create(createInventoryItemDto: CreateInventoryItemDto): Promise<InventoryItem> {
    // Verificar si el SKU ya existe
    if (createInventoryItemDto.sku) {
      const existing = await this.inventoryRepository.findOne({
        where: { sku: createInventoryItemDto.sku },
      });
      if (existing) {
        throw new BadRequestException('El SKU ya está en uso');
      }
    } else {
      // Generar SKU automático si no se proporciona
      createInventoryItemDto.sku = await this.generateSku();
    }

    const item = this.inventoryRepository.create({
      ...createInventoryItemDto,
      fechaIngreso: createInventoryItemDto.fechaIngreso
        ? new Date(createInventoryItemDto.fechaIngreso)
        : new Date(),
    });
    return this.inventoryRepository.save(item);
  }

  async findAll(branchId?: number | 'all', search?: string): Promise<InventoryItem[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.categoria', 'categoria')
      .leftJoinAndSelect('item.proveedor', 'proveedor')
      .leftJoinAndSelect('item.sucursal', 'sucursal');

    if (branchId && branchId !== 'all') {
      queryBuilder.where('item.sucursalId = :branchId', { branchId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(item.nombre ILIKE :search OR item.sku ILIKE :search OR item.marca ILIKE :search OR item.color ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['categoria', 'proveedor', 'sucursal'],
    });
    if (!item) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return item;
  }

  async update(id: number, updateInventoryItemDto: UpdateInventoryItemDto): Promise<InventoryItem> {
    const item = await this.findOne(id);

    if (updateInventoryItemDto.sku && updateInventoryItemDto.sku !== item.sku) {
      const existing = await this.inventoryRepository.findOne({
        where: { sku: updateInventoryItemDto.sku },
      });
      if (existing) {
        throw new BadRequestException('El SKU ya está en uso');
      }
    }

    Object.assign(item, updateInventoryItemDto);
    if (updateInventoryItemDto.fechaIngreso) {
      item.fechaIngreso = new Date(updateInventoryItemDto.fechaIngreso);
    }
    return this.inventoryRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.inventoryRepository.remove(item);
  }

  async updateStock(productId: number, quantity: number): Promise<InventoryItem> {
    const item = await this.findOne(productId);
    const newStock = item.stock + quantity;

    if (newStock < 0) {
      throw new BadRequestException('Stock insuficiente');
    }

    item.stock = newStock;

    // Actualizar estado según stock
    if (item.stock === 0) {
      item.estado = 'Agotado';
    } else if (item.stock <= item.stockMinimo) {
      item.estado = 'Disponible'; // Mantener disponible pero alertar
    } else {
      item.estado = 'Disponible';
    }

    return this.inventoryRepository.save(item);
  }

  async getLowStockItems(branchId?: number | 'all'): Promise<InventoryItem[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.stock <= item.stockMinimo');

    if (branchId && branchId !== 'all') {
      queryBuilder.andWhere('item.sucursalId = :branchId', { branchId });
    }

    return queryBuilder.getMany();
  }

  private async generateSku(): Promise<string> {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const baseSku = `Q${day}${month}${hour}${minute}`;

    // Verificar si existe, si existe agregar número
    let sku = baseSku;
    let counter = 1;
    while (await this.inventoryRepository.findOne({ where: { sku } })) {
      sku = `${baseSku}${counter}`;
      counter++;
    }

    return sku;
  }
}
