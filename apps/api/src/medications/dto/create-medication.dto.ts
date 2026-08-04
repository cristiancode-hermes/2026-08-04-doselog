import { IsString, IsNumber, IsEnum, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMedicationDto {
  @ApiProperty({ example: 'Amoxicillin' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'Amoxicillin trihydrate' })
  @IsOptional()
  @IsString()
  activeIngredient?: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  dosage: number;

  @ApiProperty({ example: 'mg' })
  @IsString()
  unit: string;

  @ApiProperty({ example: 'tablet', enum: ['tablet', 'capsule', 'liquid', 'injection', 'inhaler'] })
  @IsOptional()
  @IsString()
  form?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalQuantity?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  refillThreshold?: number;

  @ApiPropertyOptional({ example: 'Take with food' })
  @IsOptional()
  @IsString()
  notes?: string;
}
