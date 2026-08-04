import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
  OneToOne, JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, (u: User) => u.settings)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'theme', length: 20, default: 'system' })
  theme: 'light' | 'dark' | 'system';

  @Column({ name: 'notify_at_dose_time', type: 'boolean', default: true })
  notifyAtDoseTime: boolean;

  @Column({ name: 'notify_before_15min', type: 'boolean', default: false })
  notifyBefore15min: boolean;

  @Column({ name: 'notify_daily_summary', type: 'boolean', default: false })
  notifyDailySummary: boolean;

  @Column({ name: 'notify_refill', type: 'boolean', default: true })
  notifyRefill: boolean;

  @Column({ name: 'notify_missed_dose', type: 'boolean', default: true })
  notifyMissedDose: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
