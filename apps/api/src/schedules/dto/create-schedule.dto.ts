import { IsString, IsEnum, IsArray, IsOptional, IsNumber, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TimeSlot {
  @ApiProperty({ example: 8 })
  @IsNumber()
  @Min(0)
  @Max(23)
  hour: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  @Max(59)
  minute: number;
}

export class CreateScheduleDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'PRN'] })
  @IsEnum(['daily', 'weekly', 'PRN'])
  type: 'daily' | 'weekly' | 'PRN';

  @ApiProperty({ type: [TimeSlot], example: [{ hour: 8, minute: 0 }, { hour: 18, minute: 0 }] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlot)
  times: TimeSlot[];

  @ApiPropertyOptional({ type: [Number], example: [1, 3, 5] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxPerDay?: number;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({ example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Take before meals' })
  @IsOptional()
  @IsString()
  notes?: string;
}
