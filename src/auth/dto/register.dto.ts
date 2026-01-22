import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'juan@empresa.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[0-9]).*$/, {
    message: 'La contraseña debe contener al menos un número',
  })
  password: string;

  @ApiProperty({ example: 'admin', required: false })
  @IsString()
  @IsOptional()
  role?: string;
}
