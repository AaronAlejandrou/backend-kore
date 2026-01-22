import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  getStats(@Query('branchId') branchId?: number | 'all') {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.dashboardService.getStats(branchIdNum || branchId);
  }

  @Get('sales-by-day')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'days', required: false, description: 'Número de días (default: 14)' })
  @ApiOperation({ summary: 'Obtener ventas por día' })
  getSalesByDay(
    @Query('branchId') branchId?: number | 'all',
    @Query('days') days?: number,
  ) {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.dashboardService.getSalesByDay(branchIdNum || branchId, days ? +days : 14);
  }

  @Get('top-products')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de productos (default: 5)' })
  @ApiOperation({ summary: 'Obtener productos más vendidos' })
  getTopProducts(
    @Query('branchId') branchId?: number | 'all',
    @Query('limit') limit?: number,
  ) {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.dashboardService.getTopProducts(branchIdNum || branchId, limit ? +limit : 5);
  }

  @Get('top-categories')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de categorías (default: 5)' })
  @ApiOperation({ summary: 'Obtener top categorías' })
  getTopCategories(
    @Query('branchId') branchId?: number | 'all',
    @Query('limit') limit?: number,
  ) {
    const branchIdNum = branchId === 'all' ? undefined : branchId ? +branchId : undefined;
    return this.dashboardService.getTopCategories(branchIdNum || branchId, limit ? +limit : 5);
  }
}
