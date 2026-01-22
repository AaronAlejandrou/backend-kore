import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  tipoDocumento: 'DNI' | 'RUC' | 'Pasaporte' | 'CE';

  @Column({ type: 'varchar', length: 255, unique: true })
  numeroDocumento: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  telefono: string;

  @Column({ type: 'text', nullable: true })
  direccion: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ciudad: string;

  @Column({ type: 'date', nullable: true })
  fechaRegistro: Date;

  @Column({ type: 'int', default: 0 })
  totalCompras: number;

  @Column({ type: 'timestamp', nullable: true })
  ultimaCompra: Date | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Activo',
  })
  estado: 'Activo' | 'Inactivo';

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
