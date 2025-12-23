/**
 * Input: None (Utility module)
 * Output: Logger class, log/info/warn/error methods
 * Pos: Utility Layer - Logging utility, provides structured logging
 *
 * 🔄 Self-reference: When this file changes, update:
 * - This file header
 * - src/utils/FOLDER_INDEX.md
 * - PROJECT_INDEX.md
 */

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  log(message: string): void {
    console.log(`[${this.context}] ${message}`);
  }

  info(message: string): void {
    console.info(`[${this.context}] INFO: ${message}`);
  }

  warn(message: string): void {
    console.warn(`[${this.context}] WARN: ${message}`);
  }

  error(message: string, error?: Error): void {
    console.error(`[${this.context}] ERROR: ${message}`, error);
  }
}
