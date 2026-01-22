import { IsString, IsOptional, IsEnum, IsEmail, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 'DNI', enum: ['DNI', 'RUC', 'Pasaporte', 'CE'] })
  @IsEnum(['DNI', 'RUC', 'Pasaporte', 'CE'])
  tipoDocumento: 'DNI' | 'RUC' | 'Pasaporte' | 'CE';

  @ApiProperty({ example: '12345678' })
  @IsString()
  numeroDocumento: string;

  @ApiProperty({ example: 'juan@email.com', required: false })
  @IsOptional()
  @IsEmail()
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

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  fechaRegistro?: string;

  @ApiProperty({ example: 'Activo', enum: ['Activo', 'Inactivo'], required: false })
  @IsOptional()
  @IsEnum(['Activo', 'Inactivo'])
  estado?: 'Activo' | 'Inactivo';

  @ApiProperty({ example: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
