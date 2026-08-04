import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { Medication } from '../medications/medication.entity';

@Entity('refills')
export class Refill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medication_id' })
  medicationId: string;

  @ManyToOne(() => Medication, (m: Medication) => m.refills)
  @JoinColumn({ name: 'medication_id' })
  medication: Medication;

  @Column({ name: 'fill_date', type: 'datetime' })
  fillDate: Date;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: true })
  expiryDate: Date | null;

  @Column({ name: 'lot_number', type: 'varchar', nullable: true })
  lotNumber: string | null;

  @Column({ name: 'notes', type: 'varchar', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
