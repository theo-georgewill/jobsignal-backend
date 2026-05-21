import axios from 'axios';
import * as cheerio from 'cheerio';
import { IngestionResult } from '../types/ingestion.types';
import { detectSignal } from './signal-detector';
import { IngestedSignal } from '../types/signals.types';

function extractCompany(title: string): string {
  const words = title.split(' ');

  const stopWords = ['raises', 'launches', 'announces', 'introduces', 'hiring'];

  const index = words.findIndex((word) =>
    stopWords.includes(word.toLowerCase()),
  );

  if (index > 0) {
    return words.slice(0, index).join(' ');
  }

  return words.slice(0, 2).join(' ');
}

export async function fetchTechCrunchSignals(): Promise<IngestionResult> {
  const res = await axios.get('https://techcrunch.com');
  const $ = cheerio.load(res.data);

  const signals: IngestedSignal[] = [];

  $('article').each((_, el) => {
    const title = $(el).find('h2').text().trim();
    const link = $(el).find('a').attr('href');

    if (!title || !link) return;

    const detected = detectSignal(title);

    if (!detected) return;

    signals.push({
      type: detected.type,
      title,
      companyName: detected.companyName,
      url: link,
      source: 'techcrunch',
    });
  });

  return { signals };
}
