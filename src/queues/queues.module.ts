import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { IngestionQueue } from './ingestion.queue';
import { SignalsQueue } from './signals.queue';
import { OpportunitiesQueue } from './opportunities.queue';
import { CompanyQueue } from './company.queue';

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: 'ingestion',
      },

      {
        name: 'signals',
      },

      {
        name: 'opportunities',
      },

      {
        name: 'company',
      },
    ),
  ],

  providers: [
    IngestionQueue,
    SignalsQueue,
    OpportunitiesQueue,
    CompanyQueue,
  ],

  exports: [
    IngestionQueue,
    SignalsQueue,
    OpportunitiesQueue,
    CompanyQueue,
  ],
})
export class QueuesModule {}