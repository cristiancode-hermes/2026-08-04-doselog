import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryDoseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicationId?: string;

  @ApiPropertyOptional({ enum: ['taken', 'late', 'missed', 'skipped'] })
  @IsOptional()
  @IsEnum(['taken', 'late', 'missed', 'skipped'])
  status?: 'taken' | 'late' | 'missed' | 'skipped';
}
