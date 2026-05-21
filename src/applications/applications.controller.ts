import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

import { ApplicationsService } from './applications.service';

import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

import { ApplicationResponseDto } from './dto/application-response.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import type { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';

@ApiTags('Applications')
@ApiBearerAuth('JWT-auth')
@Controller('applications')
@UseGuards(JwtAuthGuard)
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a job application',
  })
  @ApiResponse({
    status: 201,
    type: ApplicationResponseDto,
  })
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get user applications',
  })
  @ApiResponse({
    status: 200,
    type: [ApplicationResponseDto],
  })
  findAll(@Req() req: AuthenticatedRequest) {
    return this.applicationsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single application',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: ApplicationResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update application',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: ApplicationResponseDto,
  })
  update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.applicationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete application',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Application deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.applicationsService.remove(id);
  }
}
