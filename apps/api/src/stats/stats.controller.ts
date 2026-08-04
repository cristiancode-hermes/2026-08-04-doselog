import { Controller, Get, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../shared/current-user.decorator';

@ApiTags('Stats')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('week')
  @ApiOperation({ summary: 'Get weekly adherence breakdown' })
  async getWeek(@CurrentUser('id') userId: string) {
    return this.statsService.getWeek(userId);
  }

  @Get('month/:year/:month')
  @ApiOperation({ summary: 'Get monthly adherence for a specific month' })
  async getMonth(
    @CurrentUser('id') userId: string,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.statsService.getMonth(userId, year, month);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get adherence trends (7d, 30d, 90d)' })
  async getTrends(@CurrentUser('id') userId: string) {
    return this.statsService.getTrends(userId);
  }

  @Get('streak')
  @ApiOperation({ summary: 'Get current and best streak' })
  async getStreak(@CurrentUser('id') userId: string) {
    return this.statsService.getStreak(userId);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Get dashboard overview' })
  async getOverview(@CurrentUser('id') userId: string) {
    return this.statsService.getOverview(userId);
  }
}
