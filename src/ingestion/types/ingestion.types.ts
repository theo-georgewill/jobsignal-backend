// ingestion/types/ingestion.types.ts

import { IngestedJob } from './jobs.types';
import { IngestedSignal } from './signals.types';

export type IngestionResult = {
  jobs?: IngestedJob[];
  signals?: IngestedSignal[];
};