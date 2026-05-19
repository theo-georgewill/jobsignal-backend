import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

import { Queue } from 'bullmq';

@Injectable()
export class IngestionQueue {
  constructor(
    @InjectQueue('ingestion')
    private queue: Queue,
  ) {}

  async syncCompanyJobs(
    companyId: string,
  ) {
    await this.queue.add(
      'sync-company-jobs',
      {
        companyId,
      },

      {
        attempts: 3,

        backoff: {
          type: 'exponential',
          delay: 5000,
        },

        removeOnComplete: 1000,
        removeOnFail: 5000,
      },
    );
  }

  async syncProvider(
    provider: string,
  ) {
    await this.queue.add(
      'sync-provider',
      {
        provider,
      },

      {
        attempts: 3,

        removeOnComplete: 1000,
      },
    );
  }
}