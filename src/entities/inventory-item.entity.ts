import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from './category.entity';
import { Supplier } from './supplier.entity';
import { Branch } from './branch.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'int', nullable: true })
  categoriaId: number | null;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'categoriaId' })
  categoria: Category;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subcategoria: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  marca: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  color: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  talla: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  genero: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  temporada: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  material: string;

  @Column({ type: 'int', nullable: true })
  proveedorId: number | null;

  @ManyToOne(() => Supplier, { nullable: true })
  @JoinColumn({ name: 'proveedorId' })
  proveedor: Supplier;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioCompra: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  precioVenta: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ type: 'int', default: 0 })
  stockMinimo: number;

  @Column({ type: 'int', nullable: true })
  sucursalId: number | null;

  @ManyToOne(() => Branch, { nullable: true })
  @JoinColumn({ name: 'sucursalId' })
  sucursal: Branch;

  @Column({ type: 'varchar', length: 255, nullable: true })
  ubicacion: string;

  @Column({ type: 'date', nullable: true })
  fechaIngreso: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  descuento: number;

  @Column({
    type: 'varchar',
    length: 20,
    default: 'Disponible',
  })
  estado: 'Disponible' | 'Agotado' | 'Descontinuado';

  @Column({ type: 'text', nullable: true })
  notas: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
