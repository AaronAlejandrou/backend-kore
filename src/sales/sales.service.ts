import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { SaleItem } from '../entities/sale-item.entity';
import { InventoryItem } from '../entities/inventory-item.entity';
import { Customer } from '../entities/customer.entity';
import { Branch } from '../entities/branch.entity';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { InventoryService } from '../inventory/inventory.service';
import { CustomersService } from '../customers/customers.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemRepository: Repository<SaleItem>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Branch)
    private branchRepository: Repository<Branch>,
    private inventoryService: InventoryService,
    private customersService: CustomersService,
    private dataSource: DataSource,
  ) { }

  async create(createSaleDto: CreateSaleDto, userId: number): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validar sucursal
      let branch: Branch | null = null;
      if (createSaleDto.sucursalId) {
        branch = await queryRunner.manager.findOne(Branch, {
          where: { id: createSaleDto.sucursalId, userId },
        });
        if (!branch) {
          throw new NotFoundException('Sucursal no encontrada');
        }
      } else {
        throw new BadRequestException('La sucursal es obligatoria');
      }

      // Validar cliente si se proporciona
      let customer: Customer | null = null;
      if (createSaleDto.clienteId) {
        customer = await queryRunner.manager.findOne(Customer, {
          where: { id: createSaleDto.clienteId, userId },
        });
      }

      // Validar stock y preparar items
      const items: SaleItem[] = [];
      let subtotalItemsOriginal = 0;
      let subtotalItemsFinal = 0;

      // Procesar items de la venta
      // NOTA: Se permite vender productos de cualquier sucursal.
      // La sucursalId de la venta indica DONDE se registra la venta, no de donde provienen los productos.
      // El stock se descuenta de cada producto según su sucursal de origen.

      for (const itemDto of createSaleDto.items) {
        const product = await queryRunner.manager.findOne(InventoryItem, {
          where: { id: itemDto.productId, userId },
        });

        if (!product) {
          throw new NotFoundException(
            `Producto con ID ${itemDto.productId} no encontrado`,
          );
        }

        if (product.stock < itemDto.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para ${product.nombre}. Disponible: ${product.stock}`,
          );
        }

        // Calcular subtotal del item
        const precioOriginal = product.precioVenta;

        // CUSTOM PRICE: Usar precio personalizado si se proporciona, sino usar precio del producto
        let precioBase = itemDto.precioUnitario ?? precioOriginal;
        const subtotalOriginal = itemDto.cantidad * precioOriginal;
        subtotalItemsOriginal += subtotalOriginal;

        // Aplicar descuento del item si existe (sobre el precio base)
        let precioUnitario = precioBase;
        let descuento = 0;
        if (itemDto.descuento && itemDto.descuento > 0) {
          if (itemDto.descuentoTipo === 'porcentaje') {
            descuento = (itemDto.cantidad * precioBase) * (itemDto.descuento / 100);
            precioUnitario = precioBase * (1 - itemDto.descuento / 100);
          } else {
            descuento = itemDto.descuento;
            precioUnitario = precioBase - descuento / itemDto.cantidad;
          }
        }

        const subtotal = itemDto.cantidad * precioUnitario;
        subtotalItemsFinal += subtotal;

        const saleItem = new SaleItem();
        saleItem.productId = itemDto.productId;
        saleItem.sku = product.sku;
        saleItem.nombre = product.nombre;
        saleItem.cantidad = itemDto.cantidad;
        saleItem.precioUnitario = precioUnitario;
        saleItem.precioOriginal = precioOriginal;
        saleItem.descuento = descuento;
        saleItem.descuentoTipo = itemDto.descuentoTipo || 'porcentaje';
        saleItem.subtotal = subtotal;

        items.push(saleItem);
      }


      // Calcular descuento total
      const descuentoItems = subtotalItemsOriginal - subtotalItemsFinal;
      let descuentoTotal = 0;
      if (createSaleDto.descuentoTotal && createSaleDto.descuentoTotal > 0) {
        if (createSaleDto.descuentoTotalTipo === 'porcentaje') {
          descuentoTotal = subtotalItemsFinal * (createSaleDto.descuentoTotal / 100);
        } else {
          descuentoTotal = createSaleDto.descuentoTotal;
        }
      }

      const total = subtotalItemsFinal - descuentoTotal;

      // Generar número de venta
      const numeroVenta = await this.generateSaleNumber(userId);

      // Crear venta
      const sale = new Sale();
      sale.userId = userId;
      sale.numeroVenta = numeroVenta;
      sale.fecha = new Date();
      sale.clienteId = customer?.id || null;
      sale.clienteNombre = customer?.nombre || createSaleDto.clienteNombre || 'Cliente Genérico';
      sale.documentoCliente = customer?.numeroDocumento || createSaleDto.documentoCliente || 'N/A';
      sale.tipoDocumento = createSaleDto.tipoDocumento || 'boleta';
      sale.vendedor = createSaleDto.vendedor || 'Usuario';
      sale.sucursalId = branch.id;
      sale.sucursalNombre = branch.nombre;
      sale.subtotal = subtotalItemsOriginal;
      sale.descuentoItems = descuentoItems;
      sale.descuentoTotal = descuentoTotal;
      sale.descuentoTotalTipo = createSaleDto.descuentoTotalTipo || 'porcentaje';
      sale.descuentoTotalMotivo = createSaleDto.descuentoTotalMotivo || null;
      sale.total = total;
      sale.metodoPago = createSaleDto.metodoPago || 'Efectivo';
      sale.numeroOperacion = createSaleDto.numeroOperacion || null;
      sale.estado = 'Completada';

      const savedSale = await queryRunner.manager.save(Sale, sale);

      // Asignar saleId a items y guardarlos
      items.forEach((item) => {
        item.saleId = savedSale.id;
      });
      await queryRunner.manager.save(SaleItem, items);

      // Actualizar stock de productos
      for (const item of items) {
        await queryRunner.manager.decrement(
          InventoryItem,
          { id: item.productId },
          'stock',
          item.cantidad,
        );

        // Actualizar estado del producto si queda sin stock
        const updatedProduct = await queryRunner.manager.findOne(InventoryItem, {
          where: { id: item.productId },
        });
        if (updatedProduct && updatedProduct.stock === 0) {
          updatedProduct.estado = 'Agotado';
          await queryRunner.manager.save(InventoryItem, updatedProduct);
        }
      }

      // Actualizar estadísticas del cliente
      if (customer) {
        customer.totalCompras += 1;
        customer.ultimaCompra = new Date();
        await queryRunner.manager.save(Customer, customer);
      }

      await queryRunner.commitTransaction();

      // Obtener la venta completa con relaciones
      return this.findOne(savedSale.id, userId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(userId: number, branchId?: number | 'all'): Promise<Sale[]> {
    const queryBuilder = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('sale.cliente', 'cliente')
      .leftJoinAndSelect('sale.sucursal', 'sucursal')
      .where('sale.userId = :userId', { userId })
      .orderBy('sale.fecha', 'DESC');

    if (branchId && branchId !== 'all') {
      queryBuilder.andWhere('sale.sucursalId = :branchId', { branchId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number, userId: number): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id, userId },
      relations: ['items', 'items.product', 'cliente', 'sucursal'],
    });
    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }
    return sale;
  }

  async update(id: number, updateSaleDto: UpdateSaleDto, userId: number): Promise<Sale> {
    const sale = await this.findOne(id, userId);
    Object.assign(sale, updateSaleDto);
    return this.saleRepository.save(sale);
  }

  async remove(id: number, userId: number): Promise<void> {
    const sale = await this.findOne(id, userId);
    await this.saleRepository.remove(sale);
  }

  private async generateSaleNumber(userId: number): Promise<string> {
    const userSales = await this.saleRepository.find({
      where: { userId },
    });
    const saleNumber = userSales.length + 1;
    const now = new Date();
    const timestamp = `${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate(),
    ).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
    return `${userId}${saleNumber}${timestamp}`;
  }
}
