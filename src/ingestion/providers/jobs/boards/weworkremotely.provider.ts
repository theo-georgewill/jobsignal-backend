import * as cheerio from 'cheerio';
import { IngestedJob } from '../../../types/jobs.types';

export async function scrapeWeWorkRemotely() {
  const res = await fetch('https://weworkremotely.com/remote-jobs');
  const html = await res.text();

  const $ = cheerio.load(html);

  const jobs: IngestedJob[] = [];

  $('section.jobs li').each((_, el) => {
    const link = $(el).find('a').attr('href');
    if (!link) return;

    const title = $(el).find('.title').text().trim();
    const company = $(el).find('.company').text().trim();

    if (!title || !company) return;

    jobs.push({
      title,
      company,
      location: 'Remote',
      remote: true,
      url: `https://weworkremotely.com${link}`,
      source: 'weworkremotely',
      description: '',
      tags: [],
    });
  });

  return {
    jobs, 
  };
}