import { Test, TestingModule } from '@nestjs/testing';
import { SignalsService } from './signals.service';
import { PrismaService } from '../prisma/prisma.service';
import { JobsService } from '../jobs/jobs.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('SignalsService', () => {
  let service: SignalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignalsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: JobsService,
          useValue: {},
        },
        {
          provide: getQueueToken('opportunities'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<SignalsService>(SignalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
