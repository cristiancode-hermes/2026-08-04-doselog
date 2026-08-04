import { IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ enum: ['light', 'dark', 'system'] })
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'])
  theme?: 'light' | 'dark' | 'system';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyAtDoseTime?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyBefore15min?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyDailySummary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyRefill?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyMissedDose?: boolean;
}
