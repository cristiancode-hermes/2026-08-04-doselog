import { IsNumber, IsDateString, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRefillDto {
  @ApiProperty({ example: '2026-08-01' })
  @IsDateString()
  fillDate: string;

  @ApiProperty({ example: 30 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ example: '2027-08-01' })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiPropertyOptional({ example: 'LOT12345' })
  @IsOptional()
  @IsString()
  lotNumber?: string;

  @ApiPropertyOptional({ example: 'CVS Pharmacy' })
  @IsOptional()
  @IsString()
  notes?: string;
}
