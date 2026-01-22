import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Customer } from './customer.entity';
import { Branch } from './branch.entity';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  numeroVenta: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column({ type: 'int', nullable: true })
  clienteId: number | null;

  @ManyToOne(() => Customer, { nullable: true })
  @JoinColumn({ name: 'clienteId' })
  cliente: Customer;

  @Column({ type: 'varchar', length: 255 })
  clienteNombre: string;

  @Column({ type: 'varchar', length: 255 })
  documentoCliente: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'boleta',
  })
  tipoDocumento: 'boleta' | 'factura';

  @Column({ type: 'varchar', length: 255 })
  vendedor: string;

  @Column({ type: 'int', nullable: true })
  sucursalId: number | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'sucursalId' })
  sucursal: Branch;

  @Column({ type: 'varchar', length: 255 })
  sucursalNombre: string;

  @OneToMany(() => SaleItem, (saleItem) => saleItem.sale, { cascade: true })
  items: SaleItem[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuentoItems: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  descuentoTotal: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'porcentaje',
  })
  descuentoTotalTipo: 'porcentaje' | 'monto';

  @Column({ type: 'varchar', length: 255, nullable: true })
  descuentoTotalMotivo: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Efectivo',
  })
  metodoPago: 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin' | 'Transferencia';

  @Column({ type: 'varchar', length: 255, nullable: true })
  numeroOperacion: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Completada',
  })
  estado: 'Completada' | 'Cancelada' | 'Pendiente';

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
