import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { SchedulesService } from './schedules.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';

@ApiTags('Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get('medications/:medId/schedules')
  @ApiOperation({ summary: 'Get all schedules for a medication' })
  async findByMedication(
    @CurrentUser('id') userId: string,
    @Param('medId', ParseUUIDPipe) medId: string,
  ) {
    return this.schedulesService.findByMedication(userId, medId);
  }

  @Post('medications/:medId/schedules')
  @ApiOperation({ summary: 'Create a schedule for a medication' })
  async create(
    @CurrentUser('id') userId: string,
    @Param('medId', ParseUUIDPipe) medId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.schedulesService.create(userId, medId, dto as any);
  }

  @Patch('schedules/:id')
  @ApiOperation({ summary: 'Update a schedule' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulesService.update(userId, id, dto as any);
  }

  @Delete('schedules/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a schedule' })
  async delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    return this.schedulesService.delete(userId, id);
  }
}
