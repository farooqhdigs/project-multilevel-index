/**
 * Input: None (Data model definition)
 * Output: User interface, CreateUserDTO interface
 * Pos: Data Layer - User domain model, defines user structure
 *
 * 🔄 Self-reference: When this file changes, update:
 * - This file header
 * - src/models/FOLDER_INDEX.md
 * - PROJECT_INDEX.md
 */

export interface User {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  username: string;
  password: string;
}
