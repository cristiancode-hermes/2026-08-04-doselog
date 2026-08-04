import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';

@ApiTags('Medications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active medications' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.medicationsService.findAll(userId);
  }

  @Get('archived')
  @ApiOperation({ summary: 'Get all archived medications' })
  async findArchived(@CurrentUser('id') userId: string) {
    return this.medicationsService.findArchived(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get medication by ID' })
  async findById(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.medicationsService.findById(userId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get medication stats (adherence, streak, remaining)' })
  async getStats(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.medicationsService.getStats(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new medication' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateMedicationDto) {
    return this.medicationsService.create(userId, dto as any);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a medication' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicationDto,
  ) {
    return this.medicationsService.update(userId, id, dto as any);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Archive (soft-delete) a medication' })
  async archive(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.medicationsService.archive(userId, id);
  }

  @Patch(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a medication' })
  async unarchive(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.medicationsService.unarchive(userId, id);
  }
}
