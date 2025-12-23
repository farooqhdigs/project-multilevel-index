/**
 * Input: User from models/User, Logger from utils/logger
 * Output: AuthService class, login/logout/validateToken methods
 * Pos: Service Layer - Authentication service, handles auth logic
 *
 * 🔄 Self-reference: When this file changes, update:
 * - This file header
 * - src/services/FOLDER_INDEX.md
 * - PROJECT_INDEX.md
 */

import { User } from '../models/User';
import { Logger } from '../utils/logger';

export class AuthService {
  private logger: Logger;
  private sessions: Map<string, string>; // token -> userId

  constructor() {
    this.logger = new Logger('AuthService');
    this.sessions = new Map();
  }

  async login(email: string, password: string): Promise<string | null> {
    this.logger.info(`Login attempt for: ${email}`);

    // Simplified for demo
    const token = crypto.randomUUID();
    this.sessions.set(token, email);

    this.logger.info(`Login successful for: ${email}`);
    return token;
  }

  async logout(token: string): Promise<void> {
    this.logger.info('Logout request');
    this.sessions.delete(token);
  }

  async validateToken(token: string): Promise<boolean> {
    return this.sessions.has(token);
  }
}
