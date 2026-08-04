import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LogDoseDto {
  @ApiProperty({ example: 'medication-uuid' })
  @IsString()
  medicationId: string;

  @ApiPropertyOptional({ example: 'schedule-uuid' })
  @IsOptional()
  @IsString()
  scheduleId?: string;

  @ApiPropertyOptional({ example: '2026-08-04T08:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  scheduledTime?: string;

  @ApiProperty({ enum: ['taken', 'skipped'], default: 'taken' })
  @IsOptional()
  @IsEnum(['taken', 'skipped'])
  status?: 'taken' | 'skipped';

  @ApiPropertyOptional({ example: 'Took with water' })
  @IsOptional()
  @IsString()
  notes?: string;
}
