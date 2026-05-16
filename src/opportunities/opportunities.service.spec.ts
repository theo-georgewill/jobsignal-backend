import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesService } from './opportunities.service';
import { PrismaService } from '../prisma/prisma.service';
import { OpportunitiesController } from './opportunities.controller';

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpportunitiesController],
      providers: [
        OpportunitiesService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
