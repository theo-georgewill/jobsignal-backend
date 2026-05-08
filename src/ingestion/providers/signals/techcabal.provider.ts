import axios from 'axios';
import * as cheerio from 'cheerio';
import { detectSignal } from '../../utils/signal-detector';
import { IngestionResult } from '../../types/ingestion.types';
import { IngestedSignal } from '../../types/signals.types';

export async function fetchTechCabalSignals(): Promise<IngestionResult> {
  const res = await axios.get('https://techcabal.com');

  const $ = cheerio.load(res.data);

  const signals: IngestedSignal[] = [];

  // 🔥 debug (keep for now)
  console.log('TechCabal headings:', $('h2, h3').length);

  $('h2, h3').each((_, el) => {
    const title = $(el).text().trim();

    // filter junk headings
    if (!title || title.length < 20) return;

    // find nearest link
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
        : `https://techcabal.com${link}`,
      source: 'techcabal',
    });
  });

  console.log('TechCabal signals:', signals.length);

  return { signals };
}