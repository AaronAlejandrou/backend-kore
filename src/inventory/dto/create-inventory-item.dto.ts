import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInventoryItemDto {
  @ApiProperty({ example: 'SKU001', required: false })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 'Camiseta Roja XL' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  categoriaId?: number | null;

  @ApiProperty({ example: 'Deportiva', required: false })
  @IsOptional()
  @IsString()
  subcategoria?: string;

  @ApiProperty({ example: 'Nike', required: false })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiProperty({ example: 'Rojo', required: false })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ example: 'XL', required: false })
  @IsOptional()
  @IsString()
  talla?: string;

  @ApiProperty({ example: 'Unisex', required: false })
  @IsOptional()
  @IsString()
  genero?: string;

  @ApiProperty({ example: 'Verano', required: false })
  @IsOptional()
  @IsString()
  temporada?: string;

  @ApiProperty({ example: 'Algodón', required: false })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  proveedorId?: number | null;

  @ApiProperty({ example: 25.50 })
  @IsNumber()
  @Min(0)
  precioCompra: number;

  @ApiProperty({ example: 50.00 })
  @IsNumber()
  @Min(0)
  precioVenta: number;

  @ApiProperty({ example: 100 })
  @IsInt()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  stockMinimo: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsInt()
  sucursalId?: number | null;

  @ApiProperty({ example: 'Estante A-1', required: false })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  fechaIngreso?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descuento?: number;

  @ApiProperty({
    example: 'Disponible',
    enum: ['Disponible', 'Agotado', 'Descontinuado'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['Disponible', 'Agotado', 'Descontinuado'])
  estado?: 'Disponible' | 'Agotado' | 'Descontinuado';

  @ApiProperty({ example: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
