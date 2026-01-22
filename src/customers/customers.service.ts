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
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customerRepository.findOne({
      where: { numeroDocumento: createCustomerDto.numeroDocumento },
    });

    if (existing) {
      throw new ConflictException('El número de documento ya está registrado');
    }

    const customer = this.customerRepository.create({
      ...createCustomerDto,
      fechaRegistro: createCustomerDto.fechaRegistro
        ? new Date(createCustomerDto.fechaRegistro)
        : new Date(),
    });
    return this.customerRepository.save(customer);
  }

  async findAll(search?: string): Promise<Customer[]> {
    if (search) {
      return this.customerRepository.find({
        where: [
          { nombre: Like(`%${search}%`) },
          { numeroDocumento: Like(`%${search}%`) },
          { email: Like(`%${search}%`) },
        ],
      });
    }
    return this.customerRepository.find();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }
    return customer;
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    
    if (updateCustomerDto.numeroDocumento && updateCustomerDto.numeroDocumento !== customer.numeroDocumento) {
      const existing = await this.customerRepository.findOne({
        where: { numeroDocumento: updateCustomerDto.numeroDocumento },
      });
      if (existing) {
        throw new ConflictException('El número de documento ya está registrado');
      }
    }

    Object.assign(customer, updateCustomerDto);
    if (updateCustomerDto.fechaRegistro) {
      customer.fechaRegistro = new Date(updateCustomerDto.fechaRegistro);
    }
    return this.customerRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  async incrementTotalCompras(customerId: number): Promise<void> {
    const customer = await this.findOne(customerId);
    customer.totalCompras += 1;
    customer.ultimaCompra = new Date();
    await this.customerRepository.save(customer);
  }
}
