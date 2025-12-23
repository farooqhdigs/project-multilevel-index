/**
 * Input: None (utility class)
 * Output: Logger class with static methods (info, error, warn)
 * Pos: Utility Layer - Logging utility, provides console logging functionality
 *
 * 🔄 Self-reference: When this file changes, update:
 * - This file header
 * - src/utils/FOLDER_INDEX.md
 * - PROJECT_INDEX.md
 */

export class Logger {
  static info(message: string): void {
    console.log(`[INFO] ${message}`);
  }

  static error(message: string, error?: Error): void {
    console.error(`[ERROR] ${message}`, error);
  }

  static warn(message: string): void {
    console.warn(`[WARN] ${message}`);
  }
}
