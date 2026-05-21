import { Module } from '@nestjs/common';

import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';

import { PrismaModule } from '../prisma/prisma.module';

import { QueuesModule } from '../queues/queues.module';

import { CompanyResolutionService } from '../company/services/company-resolution.service';

import { DomainDiscoveryService } from '../company/services/domain-discovery.service';

@Module({
  imports: [
    PrismaModule,
    QueuesModule,
  ],
  providers: [
    JobsService,
    CompanyResolutionService,
    DomainDiscoveryService,
  ],
  controllers: [
    JobsController,
  ],
  exports: [
    JobsService,
  ],
})
export class JobsModule {}