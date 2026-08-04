import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DosesService } from './doses.service';
import { LogDoseDto } from './dto/log-dose.dto';
import { UpdateDoseDto } from './dto/update-dose.dto';
import { QueryDoseDto } from './dto/query-dose.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';

@ApiTags('Doses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('doses')
export class DosesController {
  constructor(private readonly dosesService: DosesService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s scheduled doses with log status' })
  async getToday(@CurrentUser('id') userId: string) {
    return this.dosesService.getToday(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Query dose records by date, medication, or status' })
  @ApiQuery({ name: 'date', required: false })
  @ApiQuery({ name: 'medicationId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async query(@CurrentUser('id') userId: string, @Query() query: QueryDoseDto) {
    return this.dosesService.query(userId, query as any);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Get dose records for a specific date' })
  async findByDate(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ) {
    return this.dosesService.findByDate(userId, date);
  }

  @Post('log')
  @ApiOperation({ summary: 'Log a dose (taken/skipped)' })
  async log(@CurrentUser('id') userId: string, @Body() dto: LogDoseDto) {
    return this.dosesService.log(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a dose record' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoseDto,
  ) {
    return this.dosesService.update(userId, id, dto as any);
  }
}
