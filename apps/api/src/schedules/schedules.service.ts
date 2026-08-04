import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './schedule.entity';
import { Medication } from '../medications/medication.entity';

@Injectable()
export class SchedulesService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
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

  async findByMedication(userId: string, medicationId: string): Promise<Schedule[]> {
    await this.assertMedicationOwnership(userId, medicationId);
    return this.scheduleRepository.find({
      where: { medicationId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(userId: string, medicationId: string, data: Partial<Schedule>): Promise<Schedule> {
    await this.assertMedicationOwnership(userId, medicationId);
    const schedule = this.scheduleRepository.create({
      ...data,
      medicationId,
    } as any);
    return (await this.scheduleRepository.save(schedule)) as unknown as Schedule;
  }

  async update(userId: string, scheduleId: string, data: Partial<Schedule>): Promise<Schedule> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: { medication: true },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    if (schedule.medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(schedule, data);
    return (await this.scheduleRepository.save(schedule)) as unknown as Schedule;
  }

  async delete(userId: string, scheduleId: string): Promise<void> {
    const schedule = await this.scheduleRepository.findOne({
      where: { id: scheduleId },
      relations: { medication: true },
    });
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    if (schedule.medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    await this.scheduleRepository.remove(schedule);
  }
}
