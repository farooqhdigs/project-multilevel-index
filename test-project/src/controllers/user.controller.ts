/**
 * Input: UserService from ../services/user.service; CreateUserDTO from ../models/User; Logger from ../utils/logger
 * Output: UserController class, handleCreate/handleGetAll methods
 * Pos: Controller Layer - User HTTP controller, handles user-related requests
 *
 * 🔄 Self-reference: When this file changes, update:
 * - This file header
 * - src/controllers/FOLDER_INDEX.md
 * - PROJECT_INDEX.md
 */

import { UserService } from '../services/user.service';
import { CreateUserDTO } from '../models/User';
import { Logger } from '../utils/logger';

export class UserController {
  constructor(private userService: UserService) {}

  async handleCreate(dto: CreateUserDTO): Promise<any> {
    try {
      const user = await this.userService.createUser(dto);
      return { status: 200, data: user };
    } catch (error) {
      Logger.error('Failed to create user', error as Error);
      return { status: 500, error: 'Internal server error' };
    }
  }

  async handleGetAll(): Promise<any> {
    try {
      const users = await this.userService.findAll();
      return { status: 200, data: users };
    } catch (error) {
      Logger.error('Failed to fetch users', error as Error);
      return { status: 500, error: 'Internal server error' };
    }
  }
}
