// dto/health-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({
    example: 'ok',
    description: 'Current health status of the API.',
  })
  status!: string;

  @ApiProperty({
    example: 'jobsignal-api',
    description: 'Service name.',
  })
  service!: string;

  @ApiProperty({
    example: '2026-07-21T20:55:32.491Z',
    description: 'Current server timestamp.',
  })
  timestamp!: string;

  @ApiProperty({
    example: 1289.32,
    description: 'Server uptime in seconds.',
  })
  uptime!: number;
}