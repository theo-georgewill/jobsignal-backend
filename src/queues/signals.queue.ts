import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';

import { Queue } from 'bullmq';

@Injectable()
export class SignalsQueue {
  constructor(
    @InjectQueue('signals')
    private queue: Queue,
  ) {}

  async recompute(
    companyId: string,
  ) {
    await this.queue.add(
      'recompute-signals',
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

  async analyzeNews(
    companyId: string,
  ) {
    await this.queue.add(
      'analyze-news',
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

  async detectHiringSignals(
    companyId: string,
  ) {
    await this.queue.add(
      'detect-hiring-signals',
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

  async detectFundingSignals(
    companyId: string,
  ) {
    await this.queue.add(
      'detect-funding-signals',
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