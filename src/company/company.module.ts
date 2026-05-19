import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { CompanyProcessor } from './company.processor';
import { CompanyEnrichmentService } from './services/company-enrichment.service';
@Module({
  imports: [PrismaModule, QueuesModule],
  providers: [CompanyService, CompanyProcessor, CompanyEnrichmentService],
  controllers: [CompanyController],
  exports: [CompanyService],
})
export class CompanyModule {}
