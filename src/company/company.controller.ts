import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Res,
  Body,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  //ApiConsumes,
  ApiProduces,
  ApiBody,
} from '@nestjs/swagger';

import { CompanyService } from './company.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import { CompanyResponseDto } from './dto/company-response.dto';
import { ImportCompanyDto } from './dto/import-company.dto';
import { ExportCompaniesDto } from './dto/export-company.dto';

@ApiTags('Admin - Companies')
@ApiBearerAuth('JWT-auth')
@Controller('admin/company')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CompanyController {
  constructor(private service: CompanyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all companies',
  })
  @ApiResponse({
    status: 200,
    type: [CompanyResponseDto],
  })
  findAll() {
    return this.service.findAll();
  }

  // IMPORTANT: place BEFORE :id
  @Get(':id/logs')
  @ApiOperation({
    summary: 'Get company logs',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Company logs retrieved successfully',
  })
  logs(@Param('id') id: string) {
    return this.service.logs(id);
  }

  @Get(':id/page')
  @ApiOperation({
    summary: 'Get company intelligence page',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Company page data retrieved successfully',
  })
  findCompanyPage(@Param('id') id: string) {
    return this.service.findCompanyPage(id);
  }

  @Post('reenrich')
  @ApiOperation({
    summary: 'Re-enrich all companies',
  })
  @ApiResponse({
    status: 200,
    description: 'Re-enrichment queued',
  })
  reenrichAll() {
    return this.service.reenrichAll();
  }

  @Post(':id/run')
  @ApiOperation({
    summary: 'Run single company job ingestion',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Company ingestion triggered',
  })
  run(@Param('id') id: string) {
    return this.service.run(id);
  }

  @Post(':id/check-careers')
  @ApiOperation({
    summary:
      'Check company careers page for new jobs',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description:
      'Career page check triggered',
  })
  checkCareerPage(
    @Param('id') id: string,
  ) {
    return this.service.checkCareerPage(
      id,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single company',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: CompanyResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Create company',
  })
  @ApiResponse({
    status: 201,
    type: CompanyResponseDto,
  })
  create(@Body() body: CreateCompanyDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update company',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    type: CompanyResponseDto,
  })
  update(@Param('id') id: string, @Body() body: UpdateCompanyDto) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete company',
  })
  @ApiParam({
    name: 'id',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Company deleted successfully',
  })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('import')
  @ApiOperation({
    summary: 'Bulk import companies',
  })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        created: 120,
        updated: 42,
        skipped: 5,
        invalid: 2,
        errors: [],
      },
    },
  })
  importCompanies(@Body() body: ImportCompanyDto[]) {
    return this.service.importCompanies(body);
  }

  @Post('export')
  @ApiOperation({
    summary: 'Export companies as CSV',
  })
  @ApiBody({
    type: ExportCompaniesDto,
  })
  @ApiProduces('text/csv')
  @ApiResponse({
    status: 200,
    description: 'CSV export generated',
  })
  async exportCompanies(
    @Body() filters: ExportCompaniesDto,
    @Res() res: Response,
  ) {
    const csv = 
      await this.service.exportCompanies(
        filters,
      );
    res.setHeader(
      'Content-Type',
      'text/csv',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="companies-${Date.now()}.csv"`,
    );
    return res.send(csv);
  }
  
  @Post('backfill-canonical-names')
  @ApiOperation({
    summary: 'Backfill canonical names and merge duplicates',
  })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        updated: 120,
        merged: 184,
        errors: [],
      },
    },
  })
  backfillCanonicalNames() {
    return this.service.backfillCanonicalNames();
  }
}


