import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { DoseRecord } from '../doses/dose-record.entity';
import { Medication } from '../medications/medication.entity';
import { Schedule } from '../schedules/schedule.entity';
import { Refill } from '../refills/refill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoseRecord, Medication, Schedule, Refill]),
    AuthModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
