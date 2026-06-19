import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../ingestion/queues/queues.module';
import { CompanyProcessor } from './company.processor';
import { CompanyEnrichmentService } from './services/company-enrichment.service';
import { CompanyResolutionService } from './services/company-resolution.service';
import { DomainDiscoveryService } from './services/domain-discovery.service';
import { JobsModule } from '../jobs/jobs.module';
import { CareerPageCheckService } from './services/career-page-check.service';
import { JobDiscoveryService } from './services/job-discovery.service';
import { JobEnrichmentService } from './services/job-enrichment.service';
@Module({
  imports: [PrismaModule, QueuesModule, JobsModule],
  providers: [
    CompanyService,
    CompanyProcessor,
    CompanyEnrichmentService,
    CompanyResolutionService,
    DomainDiscoveryService,
    CareerPageCheckService,
    JobDiscoveryService,
    JobEnrichmentService,
  ],
  controllers: [CompanyController],
  exports: [CompanyService, CompanyResolutionService],
})
export class CompanyModule {}
