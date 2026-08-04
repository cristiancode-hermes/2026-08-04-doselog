import { IsString, IsEnum, IsArray, IsOptional, IsNumber, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

class TimeSlot {
  @ApiPropertyOptional({ example: 8 })
  @IsNumber()
  @Min(0)
  @Max(23)
  hour: number;

  @ApiPropertyOptional({ example: 0 })
  @IsNumber()
  @Min(0)
  @Max(59)
  minute: number;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ enum: ['daily', 'weekly', 'PRN'] })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'PRN'])
  type?: 'daily' | 'weekly' | 'PRN';

  @ApiPropertyOptional({ type: [TimeSlot] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  times?: TimeSlot[];

  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPerDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
