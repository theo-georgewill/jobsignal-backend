import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';

import { CompanyService } from './company.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('admin/company')
@UseGuards(
  JwtAuthGuard,
  AdminGuard
)
export class CompanyController {
  constructor(
    private service: CompanyService
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string
  ) {
    return this.service.findOne(id);
  }
  
  @Post()
  create(@Body() body: any) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: any
  ) {
    return this.service.update(
      id,
      body
    );
  }

  @Delete(':id')
  remove(
    @Param('id') id: string
  ) {
    return this.service.remove(id);
  }

  @Get(':id/logs')
  logs(
    @Param('id') id: string
  ) {
    return this.service.logs(id);
  }

  @Post(':id/run')
  run(
    @Param('id') id: string
  ) {
    return this.service.run(id);
  }

  @Post('bulk-import')
  bulkImport(
    @Body() body: any[]
  ) {
    return this.service.bulkImport(
      body
    );
  }

  @Post('refresh-logos')
  refreshLogos() {
    return this.service.refreshAllLogos();
  }
}