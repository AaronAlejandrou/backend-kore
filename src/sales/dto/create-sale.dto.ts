import {
  IsInt,
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  clienteId?: number | null;

  @ApiProperty({ example: 'Cliente Genérico', required: false })
  @IsOptional()
  @IsString()
  clienteNombre?: string;

  @ApiProperty({ example: 'N/A', required: false })
  @IsOptional()
  @IsString()
  documentoCliente?: string;

  @ApiProperty({ example: 'boleta', enum: ['boleta', 'factura'], required: false })
  @IsOptional()
  @IsEnum(['boleta', 'factura'])
  tipoDocumento?: 'boleta' | 'factura';

  @ApiProperty({ example: 'Usuario' })
  @IsString()
  vendedor: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  sucursalId: number;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuentoTotal?: number;

  @ApiProperty({
    example: 'porcentaje',
    enum: ['porcentaje', 'monto'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['porcentaje', 'monto'])
  descuentoTotalTipo?: 'porcentaje' | 'monto';

  @ApiProperty({ example: 'Descuento por cliente frecuente', required: false })
  @IsOptional()
  @IsString()
  descuentoTotalMotivo?: string;

  @ApiProperty({
    example: 'Efectivo',
    enum: ['Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Transferencia'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Transferencia'])
  metodoPago?: 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia';

  @ApiProperty({ example: '123456789', required: false })
  @IsOptional()
  @IsString()
  numeroOperacion?: string;
}
