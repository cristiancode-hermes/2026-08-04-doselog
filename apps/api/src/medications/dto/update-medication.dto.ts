import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMedicationDto {
  @ApiPropertyOptional({ example: 'Amoxicillin' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Amoxicillin trihydrate' })
  @IsOptional()
  @IsString()
  activeIngredient?: string;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  dosage?: number;

  @ApiPropertyOptional({ example: 'mg' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 'tablet' })
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
