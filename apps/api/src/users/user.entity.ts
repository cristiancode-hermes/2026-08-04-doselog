import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn,
  OneToMany, OneToOne, JoinColumn,
} from 'typeorm';
import { Medication } from '../medications/medication.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { UserSettings } from '../settings/user-settings.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'email', unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'name', length: 255 })
  name: string;

  @Column({ name: 'timezone', length: 100, default: 'UTC' })
  timezone: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Medication, (m: Medication) => m.user)
  medications: Medication[];

  @OneToMany(() => DoseRecord, (d: DoseRecord) => d.user)
  doseRecords: DoseRecord[];

  @OneToOne(() => UserSettings, (s: UserSettings) => s.user, { cascade: true })
  @JoinColumn({ name: 'settings_id' })
  settings: UserSettings;
}
