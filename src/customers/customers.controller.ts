import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUserId } from '../auth/get-user.decorator';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo cliente' })
  create(@Body() createCustomerDto: CreateCustomerDto, @GetUserId() userId: number) {
    return this.customersService.create(createCustomerDto, userId);
  }

  @Get()
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, documento o email' })
  @ApiOperation({ summary: 'Obtener todos los clientes' })
  findAll(@GetUserId() userId: number, @Query('search') search?: string) {
    return this.customersService.findAll(userId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener cliente por ID' })
  findOne(@Param('id') id: string, @GetUserId() userId: number) {
    return this.customersService.findOne(+id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar cliente' })
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto, @GetUserId() userId: number) {
    return this.customersService.update(+id, updateCustomerDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar cliente' })
  remove(@Param('id') id: string, @GetUserId() userId: number) {
    return this.customersService.remove(+id, userId);
  }
}
