import { Test, TestingModule } from '@nestjs/testing';
import { IngestionService } from './ingestion.service';
import { JobsService } from '../jobs/jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignalsService } from '../signals/signals.service';

describe('IngestionService', () => {
  let service: IngestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
    providers: [
      IngestionService,
      {
        provide: JobsService,
        useValue: {},
      },
      {
        provide: PrismaService,
        useValue: {},
      },
      {
        provide: SignalsService,
        useValue: {},
      },
    ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
