import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { UserSettings } from '../settings/user-settings.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSettings)
    private readonly settingsRepository: Repository<UserSettings>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(name: string, email: string, password: string, timezone?: string): Promise<User> {
    const existing = await this.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      passwordHash,
      timezone: timezone || 'UTC',
    } as any);
    const savedUser = (await this.userRepository.save(user)) as unknown as User;

    // Create default settings
    const settings = this.settingsRepository.create({
      userId: savedUser.id,
    } as any);
    await this.settingsRepository.save(settings as unknown as UserSettings);

    return savedUser;
  }

  async updateProfile(id: string, data: { name?: string; email?: string; timezone?: string }): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(user, data);
    return (await this.userRepository.save(user)) as unknown as User;
  }

  async deleteAccount(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
  }
}
