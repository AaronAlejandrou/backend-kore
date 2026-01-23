import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiOperation({ summary: 'Obtener estadísticas del dashboard' })
  getStats(@GetUserId() userId: number, @Query('branchId') branchId?: number | 'all') {
    const branchIdNum = branchId === 'all' ? 'all' : branchId ? +branchId : undefined;
    return this.dashboardService.getStats(userId, branchIdNum);
  }

  @Get('sales-by-day')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'days', required: false, description: 'Número de días (default: 14)' })
  @ApiOperation({ summary: 'Obtener ventas por día' })
  getSalesByDay(
    @GetUserId() userId: number,
    @Query('branchId') branchId?: number | 'all',
    @Query('days') days?: number,
  ) {
    const branchIdNum = branchId === 'all' ? 'all' : branchId ? +branchId : undefined;
    return this.dashboardService.getSalesByDay(userId, branchIdNum, days ? +days : 14);
  }

  @Get('top-products')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de productos (default: 5)' })
  @ApiOperation({ summary: 'Obtener productos más vendidos' })
  getTopProducts(
    @GetUserId() userId: number,
    @Query('branchId') branchId?: number | 'all',
    @Query('limit') limit?: number,
  ) {
    const branchIdNum = branchId === 'all' ? 'all' : branchId ? +branchId : undefined;
    return this.dashboardService.getTopProducts(userId, branchIdNum, limit ? +limit : 5);
  }

  @Get('top-categories')
  @ApiQuery({ name: 'branchId', required: false, description: 'ID de sucursal o "all"' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número de categorías (default: 5)' })
  @ApiOperation({ summary: 'Obtener top categorías' })
  getTopCategories(
    @GetUserId() userId: number,
    @Query('branchId') branchId?: number | 'all',
    @Query('limit') limit?: number,
  ) {
    const branchIdNum = branchId === 'all' ? 'all' : branchId ? +branchId : undefined;
    return this.dashboardService.getTopCategories(userId, branchIdNum, limit ? +limit : 5);
  }
}
