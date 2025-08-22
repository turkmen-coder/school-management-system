import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Temporary in-memory storage (will be replaced with Prisma)
export interface User {
  id: string;
  phone: string;
  email?: string;
  role: string;
  tenantId?: string;
  campusIds?: string[];
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private users: Map<string, User> = new Map();

  async create(data: Partial<User>): Promise<User> {
    const user: User = {
      id: this.generateId(),
      phone: data.phone!,
      email: data.email,
      role: data.role || 'PARENT',
      tenantId: data.tenantId,
      campusIds: data.campusIds || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      if (refreshToken) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        user.refreshToken = hashedToken;
      } else {
        user.refreshToken = undefined;
      }
      user.updatedAt = new Date();
      this.users.set(userId, user);
    }
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    Object.assign(user, data, { updatedAt: new Date() });
    this.users.set(id, user);
    return user;
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async findAll(filters?: {
    tenantId?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<{ users: User[]; total: number }> {
    let users = Array.from(this.users.values());

    if (filters) {
      if (filters.tenantId) {
        users = users.filter(user => user.tenantId === filters.tenantId);
      }
      if (filters.role) {
        users = users.filter(user => user.role === filters.role);
      }
    }

    const total = users.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const paginatedUsers = users.slice(offset, offset + limit);

    return { users: paginatedUsers, total };
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}