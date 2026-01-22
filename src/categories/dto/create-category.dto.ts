import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Camisetas' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'Categoría de camisetas', required: false })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ example: 'Activa', enum: ['Activa', 'Inactiva'], required: false })
  @IsOptional()
  @IsEnum(['Activa', 'Inactiva'])
  estado?: 'Activa' | 'Inactiva';
}
