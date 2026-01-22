import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Sale } from '../entities/sale.entity';
import { InventoryItem } from '../entities/inventory-item.entity';
import { Customer } from '../entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, InventoryItem, Customer])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
