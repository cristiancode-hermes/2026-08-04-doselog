import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Medication } from './medication.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { Schedule } from '../schedules/schedule.entity';
import { Refill } from '../refills/refill.entity';

@Injectable()
export class MedicationsService {
  constructor(
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(DoseRecord)
    private readonly doseRepository: Repository<DoseRecord>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Refill)
    private readonly refillRepository: Repository<Refill>,
  ) {}

  async findAll(userId: string): Promise<Medication[]> {
    return this.medicationRepository.find({
      where: { userId, isActive: true },
      relations: { schedules: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findArchived(userId: string): Promise<Medication[]> {
    return this.medicationRepository.find({
      where: { userId, isActive: false },
      order: { updatedAt: 'DESC' },
    });
  }

  async findById(userId: string, id: string): Promise<Medication> {
    const medication = await this.medicationRepository.findOne({
      where: { id },
      relations: { schedules: true },
    });
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
    if (medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return medication;
  }

  async create(userId: string, data: Partial<Medication>): Promise<Medication> {
    const medication = this.medicationRepository.create({
      ...data,
      userId,
    } as any);
    return (await this.medicationRepository.save(medication)) as unknown as Medication;
  }

  async update(userId: string, id: string, data: Partial<Medication>): Promise<Medication> {
    const medication = await this.findById(userId, id);
    Object.assign(medication, data);
    return (await this.medicationRepository.save(medication)) as unknown as Medication;
  }

  async archive(userId: string, id: string): Promise<void> {
    const medication = await this.findById(userId, id);
    medication.isActive = false;
    await this.medicationRepository.save(medication);
  }

  async unarchive(userId: string, id: string): Promise<Medication> {
    const medication = await this.medicationRepository.findOne({
      where: { id },
    });
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
    if (medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    medication.isActive = true;
    return (await this.medicationRepository.save(medication)) as unknown as Medication;
  }

  async getStats(userId: string, medicationId: string) {
    const medication = await this.findById(userId, medicationId);

    // Calculate adherence for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const doses = await this.doseRepository.find({
      where: {
        medicationId,
        createdAt: MoreThanOrEqual(thirtyDaysAgo),
      },
    });

    const taken = doses.filter((d) => d.status === 'taken').length;
    const late = doses.filter((d) => d.status === 'late').length;
    const missed = doses.filter((d) => d.status === 'missed').length;
    const total = taken + late + missed;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 100;

    // Calculate current streak
    const allDoses = await this.doseRepository.find({
      where: { medicationId, userId },
      order: { takenTime: 'DESC' },
    });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dose of allDoses) {
      const doseDate = new Date(dose.takenTime);
      doseDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - doseDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === streak && dose.status === 'taken') {
        streak++;
      } else if (diffDays > streak) {
        break;
      }
    }

    // Calculate remaining supply
    let remaining = medication.totalQuantity || 0;

    const refills = await this.refillRepository.find({
      where: { medicationId },
    });
    const totalRefilled = refills.reduce((sum, r) => sum + r.quantity, 0);

    const takenDoses = await this.doseRepository.count({
      where: {
        medicationId,
        status: 'taken',
      },
    });
    const lateDoses = await this.doseRepository.count({
      where: {
        medicationId,
        status: 'late',
      },
    });

    remaining = remaining + totalRefilled - (takenDoses + lateDoses);

    return { adherence, streak, remaining: Math.max(0, remaining) };
  }
}
