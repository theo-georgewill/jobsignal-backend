import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class CompanyQueue {
  constructor(
    @InjectQueue('company')
    private queue: Queue,
  ) {}

  async enrich(companyId: string) {
    await this.queue.add(
      'enrich-company',
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
}