import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Sale } from '../entities/sale.entity';
import { InventoryItem } from '../entities/inventory-item.entity';
import { Customer } from '../entities/customer.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private saleRepository: Repository<Sale>,
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async getStats(userId: number, branchId?: number | 'all') {
    const salesQuery = this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.userId = :userId', { userId });

    const inventoryQuery = this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId });

    const customersQuery = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.userId = :userId', { userId });

    if (branchId && branchId !== 'all') {
      salesQuery.andWhere('sale.sucursalId = :branchId', { branchId });
      inventoryQuery.andWhere('item.sucursalId = :branchId', { branchId });
    }

    const totalRevenueResult = await salesQuery
      .clone()
      .select('SUM(sale.total)', 'total')
      .getRawOne();
    const totalRevenue = parseFloat(totalRevenueResult?.total || '0');

    const totalSales = await salesQuery.clone().getCount();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySalesQuery = this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.userId = :userId', { userId })
      .andWhere('sale.fecha >= :today', { today })
      .andWhere('sale.fecha < :tomorrow', { tomorrow });

    if (branchId && branchId !== 'all') {
      todaySalesQuery.andWhere('sale.sucursalId = :branchId', { branchId });
    }

    const todaySales = await todaySalesQuery.getCount();

    const totalProducts = await inventoryQuery.clone().getCount();

    const totalCustomers = await customersQuery.clone().getCount();

    const lowStockQuery = this.inventoryRepository
      .createQueryBuilder('item')
      .where('item.userId = :userId', { userId })
      .andWhere('item.stock <= item.stockMinimo');

    if (branchId && branchId !== 'all') {
      lowStockQuery.andWhere('item.sucursalId = :branchId', { branchId });
    }

    const lowStockItems = await lowStockQuery.getCount();

    const recentSalesQuery = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .where('sale.userId = :userId', { userId })
      .orderBy('sale.fecha', 'DESC')
      .take(5);

    if (branchId && branchId !== 'all') {
      recentSalesQuery.andWhere('sale.sucursalId = :branchId', { branchId });
    }

    const recentSales = await recentSalesQuery.getMany();

    return {
      totalRevenue,
      totalSales,
      totalProducts,
      totalCustomers,
      lowStockItems,
      todaySales,
      recentSales,
    };
  }

  async getSalesByDay(userId: number, branchId?: number | 'all', days: number = 14) {
    const salesQuery = this.saleRepository
      .createQueryBuilder('sale')
      .where('sale.userId = :userId', { userId });

    if (branchId && branchId !== 'all') {
      salesQuery.andWhere('sale.sucursalId = :branchId', { branchId });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await salesQuery
      .andWhere('sale.fecha >= :startDate', { startDate })
      .getMany();

    const salesByDay: { fecha: string; ventas: number; ingresos: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      });

      const daySales = sales.filter((sale) => {
        const saleDate = new Date(sale.fecha);
        return (
          saleDate.getDate() === date.getDate() &&
          saleDate.getMonth() === date.getMonth() &&
          saleDate.getFullYear() === date.getFullYear()
        );
      });

      salesByDay.push({
        fecha: dateStr,
        ventas: daySales.length,
        ingresos: daySales.reduce((sum, s) => sum + parseFloat(s.total.toString()), 0),
      });
    }

    return salesByDay;
  }

  async getTopProducts(userId: number, branchId?: number | 'all', limit: number = 5) {
    const salesQuery = this.saleRepository
      .createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .where('sale.userId = :userId', { userId });

    if (branchId && branchId !== 'all') {
      salesQuery.andWhere('sale.sucursalId = :branchId', { branchId });
    }

    const sales = await salesQuery.getMany();

    const productStats: {
      [key: string]: { nombre: string; cantidad: number; ingresos: number };
    } = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productStats[item.nombre]) {
          productStats[item.nombre] = {
            nombre: item.nombre,
            cantidad: 0,
            ingresos: 0,
          };
        }
        productStats[item.nombre].cantidad += item.cantidad;
        productStats[item.nombre].ingresos += parseFloat(item.subtotal.toString());
      });
    });

    return Object.values(productStats)
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, limit);
  }

  async getTopCategories(userId: number, branchId?: number | 'all', limit: number = 5) {
    const inventoryQuery = this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.categoria', 'categoria')
      .where('item.userId = :userId', { userId });

    if (branchId && branchId !== 'all') {
      inventoryQuery.andWhere('item.sucursalId = :branchId', { branchId });
    }

    const items = await inventoryQuery.getMany();

    const categoryStats: {
      [key: string]: { categoria: string; cantidad: number; valor: number };
    } = {};

    items.forEach((item) => {
      const categoria = item.categoria?.nombre || 'Sin categoría';
      if (!categoryStats[categoria]) {
        categoryStats[categoria] = {
          categoria,
          cantidad: 0,
          valor: 0,
        };
      }
      categoryStats[categoria].cantidad += item.stock;
      categoryStats[categoria].valor +=
        item.stock * parseFloat(item.precioVenta.toString());
    });

    return Object.values(categoryStats)
      .sort((a, b) => b.valor - a.valor)
      .slice(0, limit);
  }
}
