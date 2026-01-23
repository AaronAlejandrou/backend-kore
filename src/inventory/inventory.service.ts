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
  ) { }

  /**
   * Parsea una fecha string (YYYY-MM-DD) a Date sin conversión de zona horaria
   */
  private parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async create(createInventoryItemDto: CreateInventoryItemDto, userId: number): Promise<InventoryItem> {
    // Verificar si el SKU ya existe para este usuario
    if (createInventoryItemDto.sku) {
      const existing = await this.inventoryRepository.findOne({
        where: { sku: createInventoryItemDto.sku, userId },
      });
      if (existing) {
        throw new BadRequestException('El SKU ya está en uso');
      }
    } else {
      // Generar SKU automático si no se proporciona
      createInventoryItemDto.sku = await this.generateSku(userId);
    }

    const item = this.inventoryRepository.create({
      ...createInventoryItemDto,
      userId,
      fechaIngreso: createInventoryItemDto.fechaIngreso
        ? this.parseLocalDate(createInventoryItemDto.fechaIngreso)
        : new Date(),
    });
    return this.inventoryRepository.save(item);
  }

  async findAll(userId: number, branchId?: number | 'all', search?: string): Promise<InventoryItem[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.categoria', 'categoria')
      .leftJoinAndSelect('item.proveedor', 'proveedor')
      .leftJoinAndSelect('item.sucursal', 'sucursal')
      .where('item.userId = :userId', { userId });

    if (branchId && branchId !== 'all') {
      queryBuilder.andWhere('item.sucursalId = :branchId', { branchId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(item.nombre ILIKE :search OR item.sku ILIKE :search OR item.marca ILIKE :search OR item.color ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, userId: number): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id, userId },
      relations: ['categoria', 'proveedor', 'sucursal'],
    });
    if (!item) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return item;
  }

  async update(id: number, updateInventoryItemDto: UpdateInventoryItemDto, userId: number): Promise<InventoryItem> {
    const item = await this.findOne(id, userId);

    if (updateInventoryItemDto.sku && updateInventoryItemDto.sku !== item.sku) {
      const existing = await this.inventoryRepository.findOne({
        where: { sku: updateInventoryItemDto.sku, userId },
      });
      if (existing) {
        throw new BadRequestException('El SKU ya está en uso');
      }
    }

    Object.assign(item, updateInventoryItemDto);
    if (updateInventoryItemDto.fechaIngreso) {
      item.fechaIngreso = this.parseLocalDate(updateInventoryItemDto.fechaIngreso);
    }
    return this.inventoryRepository.save(item);
  }

  async remove(id: number, userId: number): Promise<void> {
    const item = await this.findOne(id, userId);
    await this.inventoryRepository.remove(item);
  }

  async updateStock(productId: number, quantity: number, userId: number): Promise<InventoryItem> {
    const item = await this.findOne(productId, userId);
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

  async getLowStockItems(userId: number, branchId?: number | 'all'): Promise<InventoryItem[]> {
    const queryBuilder = this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.userId = :userId AND item.stock <= item.stockMinimo', { userId });

    if (branchId && branchId !== 'all') {
      queryBuilder.andWhere('item.sucursalId = :branchId', { branchId });
    }

    return queryBuilder.getMany();
  }

  private async generateSku(userId: number): Promise<string> {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const baseSku = `Q${day}${month}${hour}${minute}`;

    // Verificar si existe para este usuario, si existe agregar número
    let sku = baseSku;
    let counter = 1;
    while (await this.inventoryRepository.findOne({ where: { sku, userId } })) {
      sku = `${baseSku}${counter}`;
      counter++;
    }

    return sku;
  }
}
