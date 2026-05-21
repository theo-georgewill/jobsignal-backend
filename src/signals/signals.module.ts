import { Module } from '@nestjs/common';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsModule } from '../jobs/jobs.module';
import { BullModule } from '@nestjs/bullmq';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'opportunities',
    }),
    PrismaModule,
    JobsModule,
    CompanyModule,
  ],
  controllers: [SignalsController],
  providers: [SignalsService],
  exports: [SignalsService],
})
export class SignalsModule {}
