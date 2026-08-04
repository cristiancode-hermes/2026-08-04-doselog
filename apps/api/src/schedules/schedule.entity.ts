import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Medication } from '../medications/medication.entity';
import { DoseRecord } from '../doses/dose-record.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'medication_id' })
  medicationId: string;

  @ManyToOne(() => Medication, (m: Medication) => m.schedules)
  @JoinColumn({ name: 'medication_id' })
  medication: Medication;

  @OneToMany(() => DoseRecord, (d: DoseRecord) => d.schedule)
  doseRecords: DoseRecord[];

  @Column({ name: 'type', length: 20 })
  type: 'daily' | 'weekly' | 'PRN';

  @Column({ name: 'times', type: 'simple-json' })
  times: { hour: number; minute: number }[];

  @Column({ name: 'days_of_week', type: 'simple-json', nullable: true })
  daysOfWeek: number[] | null;

  @Column({ name: 'max_per_day', type: 'int', nullable: true })
  maxPerDay: number | null;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime', nullable: true })
  endDate: Date | null;

  @Column({ name: 'notes', type: 'varchar', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
