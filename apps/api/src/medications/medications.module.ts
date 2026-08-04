import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { Medication } from './medication.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { Schedule } from '../schedules/schedule.entity';
import { Refill } from '../refills/refill.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Medication, DoseRecord, Schedule, Refill]),
    AuthModule,
  ],
  controllers: [MedicationsController],
  providers: [MedicationsService],
  exports: [MedicationsService],
})
export class MedicationsModule {}
