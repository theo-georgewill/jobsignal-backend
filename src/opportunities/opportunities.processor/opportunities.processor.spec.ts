import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesProcessor } from '../opportunities.processor';

describe('OpportunitiesProcessor', () => {
  let provider: OpportunitiesProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OpportunitiesProcessor],
    }).compile();

    provider = module.get<OpportunitiesProcessor>(OpportunitiesProcessor);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
