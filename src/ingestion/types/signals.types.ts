// ingestion/types/signals.types.ts

export type SignalType =
  | 'funding'
  | 'hiring'
  | 'expansion'
  | 'product'
  | 'engineering'
  | 'news'
  | 'unknown';

export type IngestedSignal = {
  type: SignalType;

  title: string;

  companyName?: string;

  url?: string;

  source: string;

  payload?: Record<string, any>;
};
