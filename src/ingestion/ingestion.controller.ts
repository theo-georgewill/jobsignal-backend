import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
} from '@nestjs/common';


import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { IngestionService } from './ingestion.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@ApiTags('Admin - Ingestion')
@ApiBearerAuth('JWT-auth')
@Controller('admin/ingestion')
@UseGuards(JwtAuthGuard, AdminGuard)
export class IngestionController {
  constructor(
    private ingestionService: IngestionService
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get ingestion overview metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion overview retrieved successfully',
  })
  overview() {
    return this.ingestionService.overview();
  }

  @Get('sources')
  @ApiOperation({
    summary: 'Get all ingestion sources',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion sources retrieved successfully',
  })
  sources() {
    return this.ingestionService.sources();
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get ingestion engine status',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion engine status retrieved successfully',
  })
  status() {
    return this.ingestionService.status();
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get ingestion run history',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion history retrieved successfully',
  })
  history() {
    return this.ingestionService.history();
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Get ingestion logs',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion logs retrieved successfully',
  })
  logs() {
    return this.ingestionService.logs();
  }

  @Post('run-all')
  @ApiOperation({
    summary: 'Run all ingestion providers',
  })
  @ApiResponse({
    status: 200,
    description: 'All ingestion providers triggered',
  })
  runAll() {
    return this.ingestionService.ingestAll();
  }

  @Post('pause')
  @ApiOperation({
    summary: 'Pause ingestion engine',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion engine paused',
  })
  pause() {
    return this.ingestionService.pause();
  }

  @Post('resume')
  @ApiOperation({
    summary: 'Resume ingestion engine',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion engine resumed',
  })
  resume() {
    return this.ingestionService.resume();
  }

  @Post('source/:name/run')
  @ApiOperation({
    summary: 'Run a single ingestion source',
  })
  @ApiParam({
    name: 'name',
    type: String,
    example: 'remoteok',
  })
  @ApiResponse({
    status: 200,
    description: 'Ingestion source triggered successfully',
  })
  runSource(
    @Param('name') name: string
  ) {
    return this.ingestionService.runSource(name);
  }
}