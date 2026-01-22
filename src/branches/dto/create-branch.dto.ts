import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'Sucursal Centro' })
  @IsString()
  nombre: string;

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

  @ApiProperty({ example: '+51 987 654 321', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: 'sucursal@empresa.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'Juan Pérez', required: false })
  @IsOptional()
  @IsString()
  encargado?: string;

  @ApiProperty({ example: 'Activa', enum: ['Activa', 'Inactiva'], required: false })
  @IsOptional()
  @IsEnum(['Activa', 'Inactiva'])
  estado?: 'Activa' | 'Inactiva';

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  numeroEmpleados?: number;

  @ApiProperty({ example: '9:00 - 18:00', required: false })
  @IsOptional()
  @IsString()
  horario?: string;

  @ApiProperty({ example: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
