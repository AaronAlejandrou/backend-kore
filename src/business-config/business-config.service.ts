import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessConfig } from '../entities/business-config.entity';
import { UpdateBusinessConfigDto } from './dto/update-business-config.dto';

@Injectable()
export class BusinessConfigService {
  constructor(
    @InjectRepository(BusinessConfig)
    private businessConfigRepository: Repository<BusinessConfig>,
  ) { }

  async getConfig(userId: number): Promise<BusinessConfig> {
    let config = await this.businessConfigRepository.findOne({
      where: { userId },
    });

    if (!config) {
      config = this.businessConfigRepository.create({
        userId,
        nombreSistema: 'KORE',
      });
      config = await this.businessConfigRepository.save(config);
    }

    return config;
  }

  async updateConfig(userId: number, updateDto: UpdateBusinessConfigDto): Promise<BusinessConfig> {
    let config = await this.businessConfigRepository.findOne({
      where: { userId },
    });

    if (!config) {
      config = this.businessConfigRepository.create({
        ...updateDto,
        userId,
      });
    } else {
      Object.assign(config, updateDto);
    }

    return this.businessConfigRepository.save(config);
  }
}
