import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { JobsModule } from '../jobs/jobs.module';
import { IngestionController } from './ingestion.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [JobsModule, PrismaModule],
  providers: [IngestionService,],
  controllers: [IngestionController],
})
export class IngestionModule {}
