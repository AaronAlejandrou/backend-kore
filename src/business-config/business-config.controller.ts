import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BusinessConfigService } from './business-config.service';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';

@ApiTags('business-config')
@Controller('business-config')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BusinessConfigController {
  constructor(private readonly businessConfigService: BusinessConfigService) { }

  @Get()
  @ApiOperation({ summary: 'Obtener configuración del negocio' })
  getConfig(@GetUserId() userId: number) {
    return this.businessConfigService.getConfig(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar configuración del negocio' })
  updateConfig(@Body() updateDto: UpdateBusinessConfigDto, @GetUserId() userId: number) {
    return this.businessConfigService.updateConfig(userId, updateDto);
  }
}
