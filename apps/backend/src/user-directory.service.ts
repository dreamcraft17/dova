import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { Role, User } from 'dova-shared';
import { bcryptCost } from './bcrypt-cost';
import { DatabaseService } from './database.service';
import { AppStateService, UserRecord } from './app-state.service';

@Injectable()
export class UserDirectoryService {
  constructor(
    private readonly database: DatabaseService,
    private readonly state: AppStateService,
  ) {}

  makeUser(
    email: string,
    fullName: string,
    role: Role,
    password: string,
    opts?: { active?: boolean; emailVerified?: boolean },
  ): UserRecord {
    const isActive = opts?.active ?? true;
    const emailVerified = opts?.emailVerified ?? isActive;
    return {
      id: randomUUID(),
      email,
      fullName,
      role,
      isActive,
      emailVerifiedAt: emailVerified ? new Date().toISOString() : undefined,
      createdAt: new Date().toISOString(),
      passwordHash: bcrypt.hashSync(password, bcryptCost()),
    };
  }

  publicUser(u: UserRecord): User {
    const { passwordHash: _passwordHash, ...user } = u;
    return user;
  }

  syncUserRecord(user: UserRecord) {
    const index = this.state.users.findIndex((item) => item.id === user.id);
    if (index >= 0) this.state.users[index] = user;
  }

  async findUser(emailOrId: string, byId = false) {
    const local = byId
      ? this.state.users.find((x) => x.id === emailOrId)
      : this.state.users.find((x) => x.email === emailOrId.toLowerCase());
    if (!this.database.enabled) return local;
    return (byId ? await this.database.findUserById(emailOrId) : await this.database.findUserByEmail(emailOrId)) ?? local;
  }
}
