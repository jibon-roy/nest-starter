import { Injectable } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class LogsService {
  private readonly errorLogPath = join(process.cwd(), 'logs', 'error.log');

  async getErrorLogs(lines = 100) {
    const safeLineCount = Math.min(Math.max(lines, 1), 1000);

    try {
      const content = await readFile(this.errorLogPath, 'utf8');
      const logLines = content.split(/\r?\n/).filter(Boolean).slice(-safeLineCount);

      return {
        file: this.errorLogPath,
        lines: logLines,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          file: this.errorLogPath,
          lines: [],
        };
      }

      throw error;
    }
  }
}
