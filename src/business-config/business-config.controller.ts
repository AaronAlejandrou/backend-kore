import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessConfigService } from './business-config.service';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('business-config')
@Controller('business-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessConfigController {
  constructor(private readonly businessConfigService: BusinessConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración del negocio' })
  getConfig() {
    return this.businessConfigService.getConfig();
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar configuración del negocio' })
  updateConfig(@Body() updateDto: UpdateBusinessConfigDto) {
    return this.businessConfigService.updateConfig(updateDto);
  }
}
