import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
} from '@nestjs/common';

import {
  ApiParam,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

import { JobsService } from './jobs.service';

import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';

import { JobResponseDto } from './dto/job-response.dto';



@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private jobsService: JobsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new job',
  })
  @ApiResponse({
    status: 201,
    type: JobResponseDto,
  })
  create(@Body() body: CreateJobDto) {
    return this.jobsService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all jobs',
  })
  @ApiResponse({
    status: 200,
    type: [JobResponseDto],
  })
  findAll(@Query() query: QueryJobsDto) {
    return this.jobsService.findAll(query);
  }

  @Get('company/:companyId')
  @ApiOperation({
    summary: 'Get jobs by company ID',
  })
  @ApiParam({
    name: 'companyId',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: [JobResponseDto],
  })
  findByCompany(@Param('companyId') companyId: string) {
    return this.jobsService.findByCompany(companyId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single job',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: JobResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }

}