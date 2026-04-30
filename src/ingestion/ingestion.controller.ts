import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';

import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/ingestion')
@UseGuards(JwtAuthGuard, AdminGuard)
export class IngestionController {
  constructor(
    private ingestionService: IngestionService
  ) {}

  @Get('overview')
  overview() {
    return this.ingestionService.overview();
  }

  @Get('sources')
  sources() {
    return this.ingestionService.sources();
  }

  @Get('status')
  status() {
    return this.ingestionService.status();
  }

  @Get('history')
  history() {
    return this.ingestionService.history();
  }

  @Get('logs')
  logs() {
    return this.ingestionService.logs();
  }

  @Post('run-all')
  runAll() {
    return this.ingestionService.ingestAll();
  }

  @Post('pause')
  pause() {
    return this.ingestionService.pause();
  }

  @Post('resume')
  resume() {
    return this.ingestionService.resume();
  }

  @Post('source/:name/run')
  runSource(
    @Param('name') name: string
  ) {
    return this.ingestionService.runSource(name);
  }
}