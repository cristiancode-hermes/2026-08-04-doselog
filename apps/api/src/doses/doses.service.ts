import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DoseRecord } from './dose-record.entity';
import { Medication } from '../medications/medication.entity';
import { Schedule } from '../schedules/schedule.entity';

@Injectable()
export class DosesService {
  constructor(
    @InjectRepository(DoseRecord)
    private readonly doseRepository: Repository<DoseRecord>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async getToday(userId: string): Promise<any[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get active medications with schedules
    const medications = await this.medicationRepository.find({
      where: { userId, isActive: true },
      relations: { schedules: true },
    });

    // Get today's dose records
    const todaysDoses = await this.doseRepository.find({
      where: { userId, takenTime: Between(today, tomorrow) },
      relations: { medication: true, schedule: true },
    });

    const result: any[] = [];

    for (const med of medications) {
      const activeSchedules = (med as any).schedules?.filter((s: Schedule) => {
        const start = new Date(s.startDate);
        if (s.endDate) {
          const end = new Date(s.endDate);
          return today >= start && today <= end;
        }
        return today >= start;
      }) || [];

      for (const schedule of activeSchedules) {
        if (schedule.type === 'weekly' && schedule.daysOfWeek) {
          const dayOfWeek = today.getDay();
          const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
          if (!schedule.daysOfWeek.includes(adjustedDay)) {
            continue;
          }
        }

        if (schedule.type === 'prn' || schedule.type === 'PRN') {
          const logged = todaysDoses.find(
            (d) => d.medicationId === med.id && d.scheduleId === schedule.id,
          );
          result.push({
            medicationId: med.id,
            medicationName: med.name,
            dosage: med.dosage,
            unit: med.unit,
            form: med.form,
            scheduleId: schedule.id,
            scheduleType: schedule.type,
            times: schedule.times,
            maxPerDay: schedule.maxPerDay,
            loggedDose: logged || null,
            status: logged ? logged.status : 'prn_available',
            prn: true,
          });
        } else {
          for (const timeSlot of (schedule.times as Array<{hour: number; minute: number}>)) {
            const scheduledTime = new Date(today);
            scheduledTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

            const logged = todaysDoses.find(
              (d) =>
                d.medicationId === med.id &&
                d.scheduleId === schedule.id &&
                d.scheduledTime &&
                new Date(d.scheduledTime).getHours() === timeSlot.hour &&
                new Date(d.scheduledTime).getMinutes() === timeSlot.minute,
            );

            result.push({
              medicationId: med.id,
              medicationName: med.name,
              dosage: med.dosage,
              unit: med.unit,
              form: med.form,
              scheduleId: schedule.id,
              scheduleType: schedule.type,
              scheduledTime: scheduledTime.toISOString(),
              hour: timeSlot.hour,
              minute: timeSlot.minute,
              status: logged ? logged.status : 'pending',
              loggedDose: logged || null,
              prn: false,
            });
          }
        }
      }
    }

    return result;
  }

  async findByDate(userId: string, dateStr: string): Promise<DoseRecord[]> {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    return this.doseRepository.find({
      where: { userId, takenTime: Between(date, nextDay) },
      relations: { medication: true, schedule: true },
      order: { takenTime: 'ASC' },
    });
  }

  async query(
    userId: string,
    filters: { date?: string; medicationId?: string; status?: string },
  ): Promise<DoseRecord[]> {
    const where: any = { userId };
    if (filters.medicationId) where.medicationId = filters.medicationId;
    if (filters.status) where.status = filters.status;
    if (filters.date) {
      const date = new Date(filters.date);
      date.setHours(0, 0, 0, 0);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      where.takenTime = Between(date, nextDay);
    }

    return this.doseRepository.find({
      where,
      relations: { medication: true, schedule: true },
      order: { takenTime: 'DESC' },
    });
  }

  async log(
    userId: string,
    data: {
      medicationId: string;
      scheduleId?: string;
      scheduledTime?: string;
      status?: string;
      notes?: string;
    },
  ): Promise<DoseRecord> {
    // Verify medication ownership
    const medication = await this.medicationRepository.findOne({
      where: { id: data.medicationId },
    });
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
    if (medication.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Compute status: if taken and within 30 min → taken, else → late
    let status = data.status || 'taken';
    if (status === 'taken' && data.scheduledTime) {
      const scheduled = new Date(data.scheduledTime);
      const now = new Date();
      const diffMs = now.getTime() - scheduled.getTime();
      const diffMin = diffMs / (1000 * 60);
      if (diffMin > 30) {
        status = 'late';
      }
    }

    const dose = this.doseRepository.create({
      userId,
      medicationId: data.medicationId,
      scheduleId: data.scheduleId || null,
      scheduledTime: data.scheduledTime ? new Date(data.scheduledTime) : null,
      takenTime: new Date(),
      status: status as 'taken' | 'late' | 'missed' | 'skipped',
      notes: data.notes || null,
    } as any);

    return (await this.doseRepository.save(dose)) as unknown as DoseRecord;
  }

  async update(
    userId: string,
    doseId: string,
    data: Partial<DoseRecord>,
  ): Promise<DoseRecord> {
    const dose = await this.doseRepository.findOne({ where: { id: doseId } });
    if (!dose) {
      throw new NotFoundException('Dose record not found');
    }
    if (dose.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(dose, data);
    return (await this.doseRepository.save(dose)) as unknown as DoseRecord;
  }
}
