import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DosesController } from './doses.controller';
import { DosesService } from './doses.service';
import { DoseRecord } from './dose-record.entity';
import { Medication } from '../medications/medication.entity';
import { Schedule } from '../schedules/schedule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoseRecord, Medication, Schedule]),
    AuthModule,
  ],
  controllers: [DosesController],
  providers: [DosesService],
})
export class DosesModule {}
