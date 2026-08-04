import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refill } from './refill.entity';
import { Medication } from '../medications/medication.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { Schedule } from '../schedules/schedule.entity';

@Injectable()
export class RefillsService {
  constructor(
    @InjectRepository(Refill)
    private readonly refillRepository: Repository<Refill>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(DoseRecord)
    private readonly doseRepository: Repository<DoseRecord>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  private async assertMedicationOwnership(userId: string, medicationId: string): Promise<Medication> {
    const medication = await this.medicationRepository.findOne({
      where: { id: medicationId },
    });
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
    if (medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return medication;
  }

  async findByMedication(userId: string, medicationId: string): Promise<Refill[]> {
    await this.assertMedicationOwnership(userId, medicationId);
    return this.refillRepository.find({
      where: { medicationId },
      order: { fillDate: 'DESC' },
    });
  }

  async getSupply(userId: string, medicationId: string) {
    const medication = await this.assertMedicationOwnership(userId, medicationId);

    const initial = medication.totalQuantity || 0;

    const refills = await this.refillRepository.find({
      where: { medicationId },
    });
    const totalRefilled = refills.reduce((sum, r) => sum + r.quantity, 0);

    const takenDoses = await this.doseRepository.count({
      where: { medicationId, status: 'taken' },
    });
    const lateDoses = await this.doseRepository.count({
      where: { medicationId, status: 'late' },
    });

    const remaining = Math.max(0, initial + totalRefilled - (takenDoses + lateDoses));

    // Calculate doses per day from schedules
    const schedules = await this.scheduleRepository.find({
      where: { medicationId },
    });
    let dosesPerDay = 0;
    for (const schedule of schedules) {
      if (schedule.type === 'daily') {
        dosesPerDay += schedule.times.length;
      } else if (schedule.type === 'weekly' && schedule.daysOfWeek) {
        dosesPerDay += (schedule.times.length * schedule.daysOfWeek.length) / 7;
      }
    }

    const daysLeft = dosesPerDay > 0 ? Math.floor(remaining / dosesPerDay) : 999;
    const alert = remaining <= medication.refillThreshold;

    return {
      remaining,
      daysLeft,
      threshold: medication.refillThreshold,
      alert,
    };
  }

  async create(userId: string, medicationId: string, data: Partial<Refill>): Promise<Refill> {
    await this.assertMedicationOwnership(userId, medicationId);
    const refill = this.refillRepository.create({
      ...data,
      medicationId,
    } as any);
    return (await this.refillRepository.save(refill)) as unknown as Refill;
  }

  async update(userId: string, refillId: string, data: Partial<Refill>): Promise<Refill> {
    const refill = await this.refillRepository.findOne({
      where: { id: refillId },
      relations: { medication: true },
    });
    if (!refill) {
      throw new NotFoundException('Refill not found');
    }
    if (refill.medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(refill, data);
    return (await this.refillRepository.save(refill)) as unknown as Refill;
  }

  async delete(userId: string, refillId: string): Promise<void> {
    const refill = await this.refillRepository.findOne({
      where: { id: refillId },
      relations: { medication: true },
    });
    if (!refill) {
      throw new NotFoundException('Refill not found');
    }
    if (refill.medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.refillRepository.remove(refill);
  }
}
