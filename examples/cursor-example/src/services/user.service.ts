/**
 * Input: User, CreateUserDTO from models/User, Logger from utils/logger
 * Output: UserService class, createUser/findById/findAll methods
 * Pos: Service Layer - User domain service, orchestrates business logic
 *
 * 🔄 Self-reference: When this file changes, update:
 * - This file header
 * - src/services/FOLDER_INDEX.md
 * - PROJECT_INDEX.md
 */

import { User, CreateUserDTO } from '../models/User';
import { Logger } from '../utils/logger';

export class UserService {
  private logger: Logger;
  private users: Map<string, User>;

  constructor() {
    this.logger = new Logger('UserService');
    this.users = new Map();
  }

  async createUser(dto: CreateUserDTO): Promise<User> {
    this.logger.info(`Creating user: ${dto.username}`);

    const user: User = {
      id: crypto.randomUUID(),
      email: dto.email,
      username: dto.username,
      passwordHash: await this.hashPassword(dto.password),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    this.logger.info(`User created: ${user.id}`);

    return user;
  }

  async findById(id: string): Promise<User | null> {
    this.logger.info(`Finding user by ID: ${id}`);
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    this.logger.info('Finding all users');
    return Array.from(this.users.values());
  }

  private async hashPassword(password: string): Promise<string> {
    // Simplified for demo
    return `hashed_${password}`;
  }
}
