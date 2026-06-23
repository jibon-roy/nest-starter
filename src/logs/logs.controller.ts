import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LogsService } from './logs.service';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get('errors')
  getErrorLogs(@Query('lines') lines?: string) {
    return this.logsService.getErrorLogs(Number(lines) || 100);
  }
}
