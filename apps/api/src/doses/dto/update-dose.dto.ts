import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDoseDto {
  @ApiPropertyOptional({ enum: ['taken', 'late', 'missed', 'skipped'] })
  @IsOptional()
  @IsEnum(['taken', 'late', 'missed', 'skipped'])
  status?: 'taken' | 'late' | 'missed' | 'skipped';

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  takenTime?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
