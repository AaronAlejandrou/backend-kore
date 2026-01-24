import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.userRepository.create({
      name: registerDto.name,
      email: registerDto.email,
      password: hashedPassword,
      role: registerDto.role || 'admin',
    });

    const savedUser = await this.userRepository.save(user);

    // Generar token JWT
    const payload = { sub: savedUser.id, email: savedUser.email, role: savedUser.role };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = savedUser;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      access_token,
      user: userWithoutPassword,
    };
  }

  async validateUser(userId: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      return null;
    }
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async completeOnboarding(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    user.onboardingCompleted = true;
    await this.userRepository.save(user);
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async checkAndCompleteOnboarding(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user || user.onboardingCompleted) {
      return { completed: user?.onboardingCompleted ?? false, updated: false };
    }

    // Verificar si tiene los requisitos mínimos completados
    const dataSource = this.userRepository.manager.connection;
    
    const [branchCount] = await dataSource.query(
      'SELECT COUNT(*) as count FROM branches WHERE "userId" = $1',
      [userId]
    );
    const [categoryCount] = await dataSource.query(
      'SELECT COUNT(*) as count FROM categories WHERE "userId" = $1',
      [userId]
    );
    const [configCount] = await dataSource.query(
      'SELECT COUNT(*) as count FROM business_config WHERE "userId" = $1',
      [userId]
    );

    const hasBranches = parseInt(branchCount.count) > 0;
    const hasCategories = parseInt(categoryCount.count) > 0;
    const hasConfig = parseInt(configCount.count) > 0;

    // Si tiene al menos 1 sucursal, 1 categoría y config, marcar como completado
    if (hasBranches && hasCategories && hasConfig) {
      user.onboardingCompleted = true;
      await this.userRepository.save(user);
      const { password, ...userWithoutPassword } = user;
      return { completed: true, updated: true, user: userWithoutPassword };
    }

    return { completed: false, updated: false };
  }
}
