import * as cheerio from 'cheerio';
import { IngestedJob } from '../../types/jobs.types';

export async function scrapeJSGuruJobs(): Promise<IngestedJob[]> {
  const res = await fetch(
    'https://jsgurujobs.com/jobs'
  );

  const html = await res.text();

  const $ = cheerio.load(html);

  const jobs: IngestedJob[] = [];

  $('h3, h2').each((_, el) => {
    const title = $(el).text().trim();

    if (!title) return;

    const card =
      $(el).closest('div, article, li');

    const company =
      card.text().includes(title)
        ? card.text()
            .replace(title, '')
            .trim()
            .split('\n')[0]
        : 'Unknown';

    const link =
      card.find('a').attr('href') || '';

    jobs.push({
      title,
      company,
      location: '',
      remote: true,
      url: link.startsWith('http')
        ? link
        : `https://jsgurujobs.com${link}`,
      source: 'jsgurujobs',
      description: '',
      tags: [],
    });
  });

  return jobs;
}