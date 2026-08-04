import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Schedule } from '../schedules/schedule.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { Refill } from '../refills/refill.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u: User) => u.medications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'active_ingredient', type: 'text', length: 255, nullable: true })
  activeIngredient: string | null;

  @Column({ name: 'dosage', type: 'decimal', precision: 10, scale: 2 })
  dosage: number;

  @Column({ name: 'unit', length: 50 })
  unit: string;

  @Column({ name: 'form', length: 50, default: 'tablet' })
  form: string;

  @Column({ name: 'total_quantity', type: 'int', nullable: true })
  totalQuantity: number | null;

  @Column({ name: 'refill_threshold', type: 'int', default: 7 })
  refillThreshold: number;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Schedule, (s: Schedule) => s.medication, { cascade: true })
  schedules: Schedule[];

  @OneToMany(() => DoseRecord, (d: DoseRecord) => d.medication)
  doseRecords: DoseRecord[];

  @OneToMany(() => Refill, (r: Refill) => r.medication, { cascade: true })
  refills: Refill[];
}
