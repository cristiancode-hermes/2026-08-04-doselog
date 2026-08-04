import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RefillsController } from './refills.controller';
import { RefillsService } from './refills.service';
import { Refill } from './refill.entity';
import { Medication } from '../medications/medication.entity';
import { DoseRecord } from '../doses/dose-record.entity';
import { Schedule } from '../schedules/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Refill, Medication, DoseRecord, Schedule]),
    AuthModule,
  ],
  controllers: [RefillsController],
  providers: [RefillsService],
})
export class RefillsModule {}
