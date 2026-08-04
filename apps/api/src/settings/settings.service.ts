import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSettings } from './user-settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
  ) {}

  async getSettings(userId: string): Promise<UserSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });
    if (!settings) {
      const newSettings = this.settingsRepository.create({ userId } as any);
      return (await this.settingsRepository.save(newSettings)) as unknown as UserSettings;
    }
    return settings as unknown as UserSettings;
  }

  async updateSettings(userId: string, data: Partial<UserSettings>): Promise<UserSettings> {
    let settings = await this.settingsRepository.findOne({
      where: { userId },
    });
    if (!settings) {
      const newSettings = this.settingsRepository.create({ userId, ...data } as any);
      return (await this.settingsRepository.save(newSettings)) as unknown as UserSettings;
    }
    Object.assign(settings, data);
    return (await this.settingsRepository.save(settings)) as unknown as UserSettings;
  }
}
