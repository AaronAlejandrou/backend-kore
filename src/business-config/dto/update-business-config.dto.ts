import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBusinessConfigDto {
  @ApiProperty({ example: 'KORE', required: false })
  @IsOptional()
  @IsString()
  nombreSistema?: string;

  @ApiProperty({ example: 'Mi Empresa SAC', required: false })
  @IsOptional()
  @IsString()
  nombreEmpresa?: string;

  @ApiProperty({ example: '20123456789', required: false })
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiProperty({ example: 'Av. Principal 123', required: false })
  @IsOptional()
  @IsString()
  direccion?: string;

  @ApiProperty({ example: 'Lima', required: false })
  @IsOptional()
  @IsString()
  ciudad?: string;

  @ApiProperty({ example: '+51 987 654 321', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ example: 'contacto@empresa.com', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ example: 'www.empresa.com', required: false })
  @IsOptional()
  @IsString()
  sitioWeb?: string;
}
