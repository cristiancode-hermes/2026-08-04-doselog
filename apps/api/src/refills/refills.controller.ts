import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { RefillsService } from './refills.service';
import { CreateRefillDto } from './dto/create-refill.dto';
import { UpdateRefillDto } from './dto/update-refill.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';

@ApiTags('Refills')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class RefillsController {
  constructor(private readonly refillsService: RefillsService) {}

  @Get('medications/:medId/refills')
  @ApiOperation({ summary: 'Get all refills for a medication' })
  async findByMedication(
    @CurrentUser('id') userId: string,
    @Param('medId', ParseUUIDPipe) medId: string,
  ) {
    return this.refillsService.findByMedication(userId, medId);
  }

  @Get('medications/:medId/supply')
  @ApiOperation({ summary: 'Get supply calculation for a medication' })
  async getSupply(
    @CurrentUser('id') userId: string,
    @Param('medId', ParseUUIDPipe) medId: string,
  ) {
    return this.refillsService.getSupply(userId, medId);
  }

  @Post('medications/:medId/refills')
  @ApiOperation({ summary: 'Create a refill for a medication' })
  async create(
    @CurrentUser('id') userId: string,
    @Param('medId', ParseUUIDPipe) medId: string,
    @Body() dto: CreateRefillDto,
  ) {
    return this.refillsService.create(userId, medId, dto as any);
  }

  @Patch('refills/:id')
  @ApiOperation({ summary: 'Update a refill' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRefillDto,
  ) {
    return this.refillsService.update(userId, id, dto as any);
  }

  @Delete('refills/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a refill' })
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.refillsService.delete(userId, id);
  }
}
