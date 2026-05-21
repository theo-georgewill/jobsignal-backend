import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';

import { Job } from 'bullmq';

import { CompanyEnrichmentService } from './services/company-enrichment.service';

@Processor('company')
export class CompanyProcessor extends WorkerHost {
  constructor(
    private enrichmentService: CompanyEnrichmentService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'enrich-company':
        await this.enrichmentService.enrich(
          job.data.companyId,
        );

        break;

      default:
        break;
    }
  }
}
