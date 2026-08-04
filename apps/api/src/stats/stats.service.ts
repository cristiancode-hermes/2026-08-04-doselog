import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { DoseRecord } from '../doses/dose-record.entity';
import { Medication } from '../medications/medication.entity';
import { Schedule } from '../schedules/schedule.entity';
import { Refill } from '../refills/refill.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(DoseRecord)
    private readonly doseRepository: Repository<DoseRecord>,
    @InjectRepository(Medication)
    private readonly medicationRepository: Repository<Medication>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Refill)
    private readonly refillRepository: Repository<Refill>,
  ) {}

  async getWeek(userId: string) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek === 0 ? 7 : dayOfWeek) - 1));
    monday.setHours(0, 0, 0, 0);

    const daily: any[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const doses = await this.doseRepository.find({
        where: {
          userId,
          takenTime: Between(date, nextDate),
        },
      });

      const taken = doses.filter((d) => d.status === 'taken').length;
      const late = doses.filter((d) => d.status === 'late').length;
      const skipped = doses.filter((d) => d.status === 'skipped').length;
      const missed = doses.filter((d) => d.status === 'missed').length;
      const total = taken + late + missed;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      daily.push({
        date: date.toISOString().split('T')[0],
        adherence,
        taken,
        late,
        skipped,
        missed,
        total,
      });
    }

    return { daily };
  }

  async getMonth(userId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    const daily: any[] = [];
    let totalTaken = 0;
    let totalLate = 0;
    let totalMissed = 0;

    for (let day = 1; day <= end.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const nextDate = new Date(year, month - 1, day + 1);

      const doses = await this.doseRepository.find({
        where: {
          userId,
          takenTime: Between(date, nextDate),
        },
      });

      const taken = doses.filter((d) => d.status === 'taken').length;
      const late = doses.filter((d) => d.status === 'late').length;
      const missed = doses.filter((d) => d.status === 'missed').length;
      const skipped = doses.filter((d) => d.status === 'skipped').length;
      const total = taken + late + missed;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      totalTaken += taken;
      totalLate += late;
      totalMissed += missed;

      daily.push({
        date: date.toISOString().split('T')[0],
        adherence,
        taken,
        late,
        skipped,
        missed,
        total,
      });
    }

    const overallTotal = totalTaken + totalLate + totalMissed;
    const overall = overallTotal > 0 ? Math.round((totalTaken / overallTotal) * 100) : 0;

    return { daily, overall };
  }

  async getTrends(userId: string) {
    const now = new Date();
    const periods = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    };

    const overall: any = {};
    for (const [key, since] of Object.entries(periods)) {
      const doses = await this.doseRepository.find({
        where: {
          userId,
          takenTime: MoreThanOrEqual(since),
        },
      });
      const taken = doses.filter((d) => d.status === 'taken').length;
      const late = doses.filter((d) => d.status === 'late').length;
      const missed = doses.filter((d) => d.status === 'missed').length;
      const total = taken + late + missed;
      overall[key] = total > 0 ? Math.round((taken / total) * 100) : 0;
    }

    // By medication
    const medications = await this.medicationRepository.find({
      where: { userId, isActive: true },
    });

    const byMedication = [];
    for (const med of medications) {
      const doses = await this.doseRepository.find({
        where: {
          userId,
          medicationId: med.id,
          takenTime: MoreThanOrEqual(periods['30d']),
        },
      });
      const taken = doses.filter((d) => d.status === 'taken').length;
      const late = doses.filter((d) => d.status === 'late').length;
      const missed = doses.filter((d) => d.status === 'missed').length;
      const total = taken + late + missed;
      const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;

      byMedication.push({
        medicationId: med.id,
        medicationName: med.name,
        adherence,
        taken,
        late,
        missed,
        total,
      });
    }

    return { overall, byMedication };
  }

  async getStreak(userId: string) {
    const allDoses = await this.doseRepository.find({
      where: { userId },
      order: { takenTime: 'DESC' },
      relations: { medication: true },
    });

    // Overall streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Group by day
    const dosesByDay = new Map<string, DoseRecord[]>();
    for (const dose of allDoses) {
      const dateKey = new Date(dose.takenTime).toISOString().split('T')[0];
      if (!dosesByDay.has(dateKey)) {
        dosesByDay.set(dateKey, []);
      }
      dosesByDay.get(dateKey)!.push(dose);
    }

    const sortedDays = Array.from(dosesByDay.keys()).sort().reverse();

    // Current streak
    for (let i = 0; i < sortedDays.length; i++) {
      const dayDoses = dosesByDay.get(sortedDays[i])!;
      const allTaken = dayDoses.every((d) => d.status === 'taken');
      if (!allTaken) break;
      currentStreak++;
    }

    // Best streak
    for (const day of sortedDays) {
      const dayDoses = dosesByDay.get(day)!;
      const allTaken = dayDoses.every((d) => d.status === 'taken');
      if (allTaken) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // By medication streak
    const medications = await this.medicationRepository.find({
      where: { userId, isActive: true },
    });

    const byMedication = [];
    for (const med of medications) {
      const medDoses = allDoses.filter((d) => d.medicationId === med.id);

      const medByDay = new Map<string, DoseRecord[]>();
      for (const dose of medDoses) {
        const dateKey = new Date(dose.takenTime).toISOString().split('T')[0];
        if (!medByDay.has(dateKey)) {
          medByDay.set(dateKey, []);
        }
        medByDay.get(dateKey)!.push(dose);
      }

      const medDays = Array.from(medByDay.keys()).sort().reverse();
      let medCurrent = 0;
      let medBest = 0;
      let medTemp = 0;

      for (const day of medDays) {
        const dayDoses = medByDay.get(day)!;
        const allTaken = dayDoses.every((d) => d.status === 'taken');
        if (allTaken) {
          medTemp++;
          medBest = Math.max(medBest, medTemp);
        } else {
          medTemp = 0;
        }
      }

      // Current streak from today
      for (const day of medDays) {
        const dayDoses = medByDay.get(day)!;
        const allTaken = dayDoses.every((d) => d.status === 'taken');
        if (!allTaken) break;
        medCurrent++;
      }

      byMedication.push({
        medicationId: med.id,
        medicationName: med.name,
        current: medCurrent,
        best: medBest,
      });
    }

    return { current: currentStreak, best: bestStreak, byMedication };
  }

  async getOverview(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today progress
    const todayDoses = await this.doseRepository.find({
      where: {
        userId,
        takenTime: Between(today, tomorrow),
      },
    });
    const takenToday = todayDoses.filter((d) => d.status === 'taken').length;
    const totalToday = todayDoses.length;
    const todayPercent = totalToday > 0 ? Math.round((takenToday / totalToday) * 100) : 0;

    // Week adherence
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);
    const weekDoses = await this.doseRepository.find({
      where: {
        userId,
        takenTime: Between(weekStart, tomorrow),
      },
    });
    const weekTaken = weekDoses.filter((d) => d.status === 'taken').length;
    const weekTotal = weekTaken + weekDoses.filter((d) => d.status === 'late').length + weekDoses.filter((d) => d.status === 'missed').length;
    const weekAdherence = weekTotal > 0 ? Math.round((weekTaken / weekTotal) * 100) : 0;

    // Streak
    const streakResult = await this.getStreak(userId);

    // Refill alerts
    const medications = await this.medicationRepository.find({
      where: { userId, isActive: true },
    });

    const refillAlerts = [];
    for (const med of medications) {
      const refills = await this.refillRepository.find({
        where: { medicationId: med.id },
      });
      const totalRefilled = refills.reduce((sum, r) => sum + r.quantity, 0);
      const totalDoses = await this.doseRepository.count({
        where: {
          medicationId: med.id,
          status: 'taken',
        },
      });
      const lateDoses = await this.doseRepository.count({
        where: {
          medicationId: med.id,
          status: 'late',
        },
      });

      const initial = med.totalQuantity || 0;
      const remaining = initial + totalRefilled - (totalDoses + lateDoses);

      if (remaining <= med.refillThreshold) {
        refillAlerts.push({
          medicationId: med.id,
          medicationName: med.name,
          remaining: Math.max(0, remaining),
          threshold: med.refillThreshold,
        });
      }
    }

    return {
      todayProgress: {
        taken: takenToday,
        total: totalToday,
        percent: todayPercent,
      },
      weekAdherence,
      streak: streakResult.current,
      refillAlerts,
    };
  }
}
