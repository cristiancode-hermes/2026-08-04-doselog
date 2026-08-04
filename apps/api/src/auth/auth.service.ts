import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string, timezone?: string) {
    const user = await this.usersService.create(name, email, password, timezone);
    const token = this.generateToken(user);
    return { token, user: this.sanitizeUser(user) };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.generateToken(user);
    return { token, user: this.sanitizeUser(user) };
  }

  async getProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { user: this.sanitizeUser(user) };
  }

  async updateProfile(userId: string, data: { name?: string; email?: string; timezone?: string }) {
    const user = await this.usersService.updateProfile(userId, data);
    return { user: this.sanitizeUser(user) };
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersService.deleteAccount(userId);
  }

  private generateToken(user: { id: string; email: string; name: string }): string {
    return this.jwtService.sign({ id: user.id, email: user.email, name: user.name });
  }

  private sanitizeUser(user: { id: string; email: string; name: string; timezone: string; createdAt: Date; updatedAt: Date }) {
    const { passwordHash, ...rest } = user as any;
    return rest;
  }
}
