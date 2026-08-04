import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/user.entity';
import { Medication } from '../medications/medication.entity';
import { Schedule } from '../schedules/schedule.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { Refill } from '../refills/refill.entity';
import { UserSettings } from '../settings/user-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Medication, Schedule, DoseRecord, Refill, UserSettings]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
