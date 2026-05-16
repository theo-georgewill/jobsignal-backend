import axios from 'axios';
import * as cheerio from 'cheerio';
import { detectSignal } from '../../utils/signal-detector';
import { IngestionResult } from '../../types/ingestion.types';
import { IngestedSignal } from '../../types/signals.types';

export async function fetchTechpointSignals(): Promise<IngestionResult> {
  const res = await axios.get('https://techpoint.africa');

  const $ = cheerio.load(res.data);

  const signals: IngestedSignal[] = [];

  $('h2, h3').each((_, el) => {
    const title = $(el).text().trim();

    if (!title) return;

    // find nearest link (parent or ancestor)
    const link =
      $(el).closest('a').attr('href') ||
      $(el).parent().find('a').attr('href') ||
      '';

    if (!link) return;

    const detected = detectSignal(title);

    if (!detected) return;

    signals.push({
      type: detected.type,
      title,
      companyName: detected.companyName,
      url: link.startsWith('http')
        ? link
        : `https://techpoint.africa${link}`,
      source: 'techpoint',
    });
  });

  console.log('Techpoint signals:', signals.length);

  return { signals };
}