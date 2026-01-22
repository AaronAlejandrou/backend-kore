import { IsInt, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  productId: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @ApiProperty({
    example: 'porcentaje',
    enum: ['porcentaje', 'monto'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['porcentaje', 'monto'])
  descuentoTipo?: 'porcentaje' | 'monto';
}
