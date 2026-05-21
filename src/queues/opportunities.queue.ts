import { Injectable } from '@nestjs/common';

import { InjectQueue } from '@nestjs/bull';

import type { Queue } from 'bull';

@Injectable()
export class OpportunitiesQueue {
  constructor(
    @InjectQueue('opportunities')
    private queue: Queue,
  ) {}

  async recomputeCompany(companyId: string) {
    await this.queue.add(
      'recompute-company',
      {
        companyId,
      },
      {
        removeOnComplete: true,

        attempts: 3,
      },
    );
  }
}
