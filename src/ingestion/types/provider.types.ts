import { IngestionResult } from './ingestion.types';

export type ProviderType = 'job' | 'signal' | 'company' | 'careers';

export type Provider = {
  name: string;
  type: ProviderType;
  runner: () => Promise<IngestionResult>;
};
