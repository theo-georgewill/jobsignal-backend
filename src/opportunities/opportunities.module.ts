import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';
import { OpportunitiesProcessor } from './opportunities.processor';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'opportunities', 
    }),
  ],
  controllers: [OpportunitiesController],
  providers: [
    OpportunitiesService, 
    OpportunitiesProcessor
  ],
  exports: [OpportunitiesService],
})
export class OpportunitiesModule {}
