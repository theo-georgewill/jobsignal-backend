import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { HealthResponseDto } from './dto/health-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the current health status of the JobSignal API.',
  })
  @ApiOkResponse({
    description: 'The API is healthy.',
    type: HealthResponseDto,
  })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'jobsignal-api',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}