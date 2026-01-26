import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { config } from 'dotenv';

config();

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  entities: [__dirname + '/../**/*.entity{.ts,.js}'],

  // OJO: si tu DB ya tiene data importante, lo más seguro es dejar esto en false
  synchronize: false,
  // synchronize: process.env.NODE_ENV !== 'production',

  logging: process.env.NODE_ENV === 'development',

  // Supabase requiere SSL
  ssl: { rejectUnauthorized: false },

  // (Opcional pero recomendado) evita errores raros de timezone
  extra: {
    timezone: 'UTC',
  },
};
