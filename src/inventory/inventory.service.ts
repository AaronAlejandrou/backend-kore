import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In, DataSource } from 'typeorm';
import { InventoryItem } from '../entities/inventory-item.entity';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

// Interfaz para errores de importación
export interface ImportError {
  fila: number;
  columna: string;
  error: string;
}

// Interfaz para resultado de importación
export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: ImportError[];
  createdCategories: string[];
}

// Tipo extendido para importación con nombre de categoría
export type BulkImportItemDto = CreateInventoryItemDto & { categoryName?: string };

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    private dataSource: DataSource,
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
    // Buscar el item SIN cargar relaciones para evitar conflictos
    const item = await this.inventoryRepository.findOne({
      where: { id, userId },
    });
    
    if (!item) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    if (updateInventoryItemDto.sku && updateInventoryItemDto.sku !== item.sku) {
      const existing = await this.inventoryRepository.findOne({
        where: { sku: updateInventoryItemDto.sku, userId },
      });
      if (existing) {
        throw new BadRequestException('El SKU ya está en uso');
      }
    }

    // Asignar los nuevos valores
    Object.assign(item, updateInventoryItemDto);
    
    if (updateInventoryItemDto.fechaIngreso) {
      item.fechaIngreso = this.parseLocalDate(updateInventoryItemDto.fechaIngreso);
    }
    
    // Guardar y luego retornar con relaciones cargadas
    await this.inventoryRepository.save(item);
    return this.findOne(id, userId);
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

  /**
   * Importación masiva de productos con manejo transaccional
   * Si hay algún error, no se guarda ningún producto
   */
  async bulkImport(
    items: BulkImportItemDto[],
    userId: number,
    categoryResolver: (nombre: string) => Promise<{ id: number; created: boolean; nombre: string }>,
  ): Promise<ImportResult> {
    const errors: ImportError[] = [];
    const createdCategories: string[] = [];
    const skusInBatch = new Map<string, number>(); // Para detectar SKUs duplicados dentro del mismo archivo
    const itemsToCreate: InventoryItem[] = [];
    const categoryCache = new Map<string, number>(); // Cache para evitar múltiples consultas

    // Fase 1: Validación completa de todos los items
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 2; // +2 porque fila 1 es encabezado y arrays empiezan en 0

      // Validar campos obligatorios
      if (!item.nombre || item.nombre.trim() === '') {
        errors.push({ fila: rowNum, columna: 'Nombre', error: 'El nombre del producto es obligatorio' });
      }

      if (item.precioVenta === undefined || item.precioVenta === null || item.precioVenta <= 0) {
        errors.push({ fila: rowNum, columna: 'Precio Venta', error: 'El precio de venta debe ser mayor a 0' });
      }

      if (item.stock === undefined || item.stock === null || item.stock < 0) {
        errors.push({ fila: rowNum, columna: 'Stock', error: 'El stock debe ser un número válido (0 o mayor)' });
      }

      // Validar SKU único en la base de datos
      if (item.sku) {
        const existingItem = await this.inventoryRepository.findOne({
          where: { sku: item.sku, userId },
        });
        if (existingItem) {
          errors.push({ fila: rowNum, columna: 'SKU', error: `El SKU "${item.sku}" ya existe en el inventario` });
        }

        // Validar SKU único dentro del archivo
        if (skusInBatch.has(item.sku.toLowerCase())) {
          const previousRow = skusInBatch.get(item.sku.toLowerCase());
          errors.push({ fila: rowNum, columna: 'SKU', error: `El SKU "${item.sku}" está duplicado en el archivo (también en fila ${previousRow})` });
        } else {
          skusInBatch.set(item.sku.toLowerCase(), rowNum);
        }
      }

      // Validar sucursal si se proporciona
      if (!item.sucursalId) {
        errors.push({ fila: rowNum, columna: 'Sucursal', error: 'La sucursal es obligatoria' });
      }
    }

    // Si hay errores de validación, retornar sin hacer nada
    if (errors.length > 0) {
      return {
        success: false,
        importedCount: 0,
        errors,
        createdCategories: [],
      };
    }

    // Fase 2: Resolver categorías (todas a la vez para evitar duplicados)
    const uniqueCategories = new Set<string>();
    for (const item of items) {
      if (item.categoryName) {
        uniqueCategories.add(item.categoryName.toLowerCase());
      }
    }

    // Resolver cada categoría única una sola vez
    for (const categoryNameLower of uniqueCategories) {
      // Buscar el nombre original con mayúsculas
      const originalName = items.find(
        i => i.categoryName?.toLowerCase() === categoryNameLower
      )?.categoryName || categoryNameLower;

      try {
        const result = await categoryResolver((originalName as any));
        categoryCache.set(categoryNameLower, result.id);
        if (result.created) {
          createdCategories.push(result.nombre);
        }
      } catch (err) {
        errors.push({
          fila: 0,
          columna: 'Categoría',
          error: `Error al procesar categoría "${originalName}": ${err.message}`,
        });
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        importedCount: 0,
        errors,
        createdCategories: [],
      };
    }

    // Fase 3: Preparar items con categorías resueltas
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      // Resolver categoría desde cache
      if (item.categoryName) {
        const catId = categoryCache.get(item.categoryName.toLowerCase());
        if (catId) {
          item.categoriaId = catId;
        }
      }

      // Generar SKU si no tiene
      if (!item.sku) {
        item.sku = await this.generateSku(userId);
        // Agregar al batch para evitar duplicados
        skusInBatch.set(item.sku.toLowerCase(), i + 2);
      }

      const inventoryItem = this.inventoryRepository.create({
        ...item,
        userId,
        fechaIngreso: item.fechaIngreso
          ? this.parseLocalDate(item.fechaIngreso)
          : new Date(),
      });
      itemsToCreate.push(inventoryItem);
    }

    // Fase 4: Guardar todo en una transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Guardar todos los items
      for (const item of itemsToCreate) {
        await queryRunner.manager.save(item);
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        importedCount: itemsToCreate.length,
        errors: [],
        createdCategories,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();

      // Extraer mensaje de error más descriptivo
      let errorMessage = 'Error desconocido al guardar productos';
      if (err.message) {
        if (err.message.includes('duplicate') || err.message.includes('UNIQUE')) {
          errorMessage = 'Hay productos con SKU duplicado';
        } else if (err.message.includes('foreign key') || err.message.includes('FK_')) {
          errorMessage = 'Referencia inválida (categoría, proveedor o sucursal no existe)';
        } else {
          errorMessage = err.message;
        }
      }

      return {
        success: false,
        importedCount: 0,
        errors: [{ fila: 0, columna: 'General', error: errorMessage }],
        createdCategories: [],
      };
    } finally {
      await queryRunner.release();
    }
  }
}
