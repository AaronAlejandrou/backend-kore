import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) { }

  /**
   * Parsea una fecha string (YYYY-MM-DD) a Date sin conversión de zona horaria
   */
  private parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async create(createCustomerDto: CreateCustomerDto, userId: number): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { numeroDocumento: createCustomerDto.numeroDocumento, userId },
    });

    if (existing) {
      throw new ConflictException('El número de documento ya está registrado');
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      userId,
      fechaRegistro: createCustomerDto.fechaRegistro
        ? this.parseLocalDate(createCustomerDto.fechaRegistro)
        : new Date(),
    });
    return this.customerRepository.save(customer);
  }

  async findAll(userId: number, search?: string): Promise<Customer[]> {
    if (search) {
      return this.customerRepository.find({
        where: [
          { userId, nombre: Like(`%${search}%`) },
          { userId, numeroDocumento: Like(`%${search}%`) },
          { userId, email: Like(`%${search}%`) },
        ],
      });
    }
    return this.customerRepository.find({ where: { userId } });
  }

  async findOne(id: number, userId: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id, userId } });
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto, userId: number): Promise<Customer> {
    const customer = await this.findOne(id, userId);

    if (updateCustomerDto.numeroDocumento && updateCustomerDto.numeroDocumento !== customer.numeroDocumento) {
      const existing = await this.customerRepository.findOne({
        where: { numeroDocumento: updateCustomerDto.numeroDocumento, userId },
      });
      if (existing) {
        throw new ConflictException('El número de documento ya está registrado');
      }
    }

    Object.assign(customer, updateCustomerDto);
    if (updateCustomerDto.fechaRegistro) {
      customer.fechaRegistro = this.parseLocalDate(updateCustomerDto.fechaRegistro);
    }
    return this.customerRepository.save(customer);
  }

  async remove(id: number, userId: number): Promise<void> {
    const customer = await this.findOne(id, userId);
    await this.customerRepository.remove(customer);
  }

  async incrementTotalCompras(customerId: number, userId: number): Promise<void> {
    const customer = await this.findOne(customerId, userId);
    customer.totalCompras += 1;
    customer.ultimaCompra = new Date();
    await this.customerRepository.save(customer);
  }
}
