import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { QueuesModule } from '../queues/queues.module';
import { CompanyProcessor } from './company.processor';
import { CompanyEnrichmentService } from './services/company-enrichment.service';
import { CompanyResolutionService } from './services/company-resolution.service';
import { DomainDiscoveryService } from './services/domain-discovery.service';
@Module({
  imports: [PrismaModule, QueuesModule],
  providers: [
    CompanyService, 
    CompanyProcessor, 
    CompanyEnrichmentService, 
    CompanyResolutionService,
    DomainDiscoveryService,
  ],
  controllers: [CompanyController],
  exports: [CompanyService, CompanyResolutionService],
})
export class CompanyModule {}
