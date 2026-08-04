import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Medication } from '../medications/medication.entity';
import { Schedule } from '../schedules/schedule.entity';

@Entity('dose_records')
export class DoseRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u: User) => u.doseRecords)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'medication_id' })
  medicationId: string;

  @ManyToOne(() => Medication, (m: Medication) => m.doseRecords)
  @JoinColumn({ name: 'medication_id' })
  medication: Medication;

  @Column({ name: 'schedule_id', type: 'text', nullable: true })
  scheduleId: string | null;

  @ManyToOne(() => Schedule, (s: Schedule) => s.doseRecords, { nullable: true })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule | null;

  @Column({ name: 'scheduled_time', type: 'datetime', nullable: true })
  scheduledTime: Date | null;

  @Column({ name: 'taken_time', type: 'datetime', default: () => "datetime('now')" })
  takenTime: Date;

  @Column({ name: 'status', length: 20, default: 'taken' })
  status: 'taken' | 'late' | 'missed' | 'skipped';

  @Column({ name: 'notes', type: 'varchar', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
