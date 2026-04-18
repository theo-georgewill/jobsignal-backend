import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { JobsModule } from '../jobs/jobs.module';
import { IngestionController } from './ingestion.controller';

@Module({
  imports: [JobsModule],
  providers: [IngestionService,],
  controllers: [IngestionController],
})
export class IngestionModule {}
