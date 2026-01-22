import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Juan Proveedor' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Proveedores SAC', required: false })
  @IsOptional()
  @IsString()
  empresa?: string;

  @ApiProperty({ example: 'proveedor@empresa.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: '+51 987 654 321', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: 'Av. Principal 123', required: false })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ example: 'Lima', required: false })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiProperty({ example: 'Perú', required: false })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiProperty({ example: 'Textil', required: false })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiProperty({ example: 'Activo', enum: ['Activo', 'Inactivo'], required: false })
  @IsOptional()
  @IsEnum(['Activo', 'Inactivo'])
  estado?: 'Activo' | 'Inactivo';

  @ApiProperty({ example: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
