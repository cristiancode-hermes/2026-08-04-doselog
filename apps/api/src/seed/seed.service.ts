import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Medication } from '../medications/medication.entity';
import { Schedule } from '../schedules/schedule.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { Refill } from '../refills/refill.entity';
import { UserSettings } from '../settings/user-settings.entity';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(DoseRecord)
    private readonly doseRepository: Repository<DoseRecord>,
    @InjectRepository(Refill)
    private readonly refillRepository: Repository<Refill>,
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
  ) {}

  async seed() {
    this.logger.log('Starting database seeding...');

    // Clear existing data
    await this.doseRepository.clear();
    await this.refillRepository.clear();
    await this.scheduleRepository.clear();
    await this.medicationRepository.clear();
    await this.settingsRepository.clear();
    await this.userRepository.clear();

    // Create demo user
    const passwordHash = await bcrypt.hash('demo123456', 10);
    const user = this.userRepository.create({
      name: 'Demo User',
      email: 'demo@doselog.com',
      passwordHash,
      timezone: 'UTC',
    } as any);
    const savedUser = (await this.userRepository.save(user)) as unknown as User;

    // Create settings
    const settings = this.settingsRepository.create({
      userId: savedUser.id,
    } as any);
    await this.settingsRepository.save(settings as unknown as UserSettings);

    // Medication 1: Amoxicillin
    const med1 = this.medicationRepository.create({
      userId: savedUser.id,
      name: 'Amoxicillin',
      activeIngredient: 'Amoxicillin trihydrate',
      dosage: 500,
      unit: 'mg',
      form: 'capsule',
      totalQuantity: 30,
      refillThreshold: 5,
      notes: 'Take with food to avoid stomach upset',
    } as any);
    const savedMed1 = (await this.medicationRepository.save(med1)) as unknown as Medication;

    // Schedule: twice daily
    const schedule1 = this.scheduleRepository.create({
      medicationId: savedMed1.id,
      type: 'daily',
      times: [{ hour: 8, minute: 0 }, { hour: 20, minute: 0 }],
      startDate: new Date('2026-07-01'),
    } as any);
    await this.scheduleRepository.save(schedule1 as unknown as Schedule);
    const savedSchedule1 = (await this.scheduleRepository.findOne({
      where: { medicationId: savedMed1.id },
      order: { createdAt: 'DESC' },
    })) as unknown as Schedule;

    // Refill for med1
    const refill1 = this.refillRepository.create({
      medicationId: savedMed1.id,
      fillDate: new Date('2026-07-15'),
      quantity: 30,
      notes: 'CVS Pharmacy',
    } as any);
    await this.refillRepository.save(refill1 as unknown as Refill);

    // Dose records for last 10 days
    const now = new Date();
    for (let day = 9; day >= 0; day--) {
      const doseDate = new Date(now);
      doseDate.setDate(doseDate.getDate() - day);
      doseDate.setHours(8, 0, 0, 0);

      const doseTime = new Date(doseDate);
      doseTime.setHours(8, 5, 0, 0); // 5 min late

      const dose = this.doseRepository.create({
        userId: savedUser.id,
        medicationId: savedMed1.id,
        scheduleId: savedSchedule1.id,
        scheduledTime: doseDate,
        takenTime: doseTime,
        status: day < 2 ? 'taken' : day < 5 ? 'late' : 'taken',
      } as any);
      await this.doseRepository.save(dose as unknown as DoseRecord);
    }

    // Medication 2: Metformin
    const med2 = this.medicationRepository.create({
      userId: savedUser.id,
      name: 'Metformin',
      activeIngredient: 'Metformin hydrochloride',
      dosage: 1000,
      unit: 'mg',
      form: 'tablet',
      totalQuantity: 60,
      refillThreshold: 10,
      notes: 'Take with breakfast and dinner',
    } as any);
    const savedMed2 = (await this.medicationRepository.save(med2)) as unknown as Medication;

    // Schedule: twice daily
    const schedule2 = this.scheduleRepository.create({
      medicationId: savedMed2.id,
      type: 'daily',
      times: [{ hour: 7, minute: 0 }, { hour: 19, minute: 0 }],
      startDate: new Date('2026-06-01'),
    } as any);
    const savedSchedule2 = (await this.scheduleRepository.save(schedule2 as unknown as Schedule)) as unknown as Schedule;

    // Dose records for metformin
    for (let day = 9; day >= 0; day--) {
      const doseDate = new Date(now);
      doseDate.setDate(doseDate.getDate() - day);
      doseDate.setHours(7, 0, 0, 0);

      const doseTime = new Date(doseDate);
      doseTime.setHours(7, 2, 0, 0);

      const dose = this.doseRepository.create({
        userId: savedUser.id,
        medicationId: savedMed2.id,
        scheduleId: savedSchedule2.id,
        scheduledTime: doseDate,
        takenTime: doseTime,
        status: day < 3 ? 'taken' : 'taken',
      } as any);
      await this.doseRepository.save(dose as unknown as DoseRecord);
    }

    // Medication 3: Ibuprofen (PRN)
    const med3 = this.medicationRepository.create({
      userId: savedUser.id,
      name: 'Ibuprofen',
      activeIngredient: 'Ibuprofen',
      dosage: 400,
      unit: 'mg',
      form: 'tablet',
      totalQuantity: 20,
      notes: 'Take as needed for pain, max 3 per day',
    } as any);
    const savedMed3 = (await this.medicationRepository.save(med3)) as unknown as Medication;

    // PRN schedule
    const schedule3 = this.scheduleRepository.create({
      medicationId: savedMed3.id,
      type: 'PRN',
      times: [{ hour: 0, minute: 0 }],
      maxPerDay: 3,
      startDate: new Date('2026-07-01'),
      notes: 'As needed for pain',
    } as any);
    await this.scheduleRepository.save(schedule3 as unknown as Schedule);

    // Medication 4: Weekly - Vitamin D
    const med4 = this.medicationRepository.create({
      userId: savedUser.id,
      name: 'Vitamin D',
      activeIngredient: 'Cholecalciferol',
      dosage: 2000,
      unit: 'IU',
      form: 'capsule',
      totalQuantity: 30,
      refillThreshold: 5,
    } as any);
    const savedMed4 = (await this.medicationRepository.save(med4)) as unknown as Medication;

    // Weekly schedule - Monday, Wednesday, Friday
    const schedule4 = this.scheduleRepository.create({
      medicationId: savedMed4.id,
      type: 'weekly',
      times: [{ hour: 9, minute: 0 }],
      daysOfWeek: [1, 3, 5],
      startDate: new Date('2026-07-01'),
    } as any);
    await this.scheduleRepository.save(schedule4 as unknown as Schedule);

    this.logger.log(`Seeding complete. Demo user: demo@doselog.com / demo123456`);
  }
}
