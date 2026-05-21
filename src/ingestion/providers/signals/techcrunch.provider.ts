import { IngestionResult } from '../../types/ingestion.types';

export async function fetchTechCrunchSignals(): Promise<IngestionResult> {
  return {
    signals: [
      {
        type: 'funding',
        title: 'Startup raises funding',
        companyName: 'stripe',
        url: 'https://techcrunch.com/example',
        source: 'techcrunch',
      },
    ],
  };
}
