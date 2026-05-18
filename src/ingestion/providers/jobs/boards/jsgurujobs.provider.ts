import * as cheerio from 'cheerio';

import { IngestedJob } from '../../../types/jobs.types';

import { stripHtml } from '../../../utils/strip-html';

export async function scrapeJSGuruJobs() {
  const res = await fetch(
    'https://jsgurujobs.com/jobs'
  );

  const html = await res.text();

  const $ = cheerio.load(html);

  const jobs: IngestedJob[] = [];

  $('.bg-white.shadow-sm.rounded-lg.divide-y.divide-gray-200 > div.p-6')
    .each((_, el) => {

      const title =
        $(el)
          .find('h3 a')
          .first()
          .text()
          .trim();

      if (!title) return;

      const relativeUrl =
        $(el)
          .find('h3 a')
          .first()
          .attr('href') || '';

      const url =
        relativeUrl.startsWith('http')
          ? relativeUrl
          : `https://jsgurujobs.com${relativeUrl}`;

      const company =
        $(el)
          .find('p.text-sm.text-gray-500')
          .first()
          .text()
          .trim();

      const meta =
        $(el)
          .find(
            '.mt-2.flex.items-center.text-sm.text-gray-500 span'
          );

      const location =
        meta.eq(0).text().trim();

      const employmentType =
        meta.eq(1).text().trim();

      const salary =
        meta.eq(2).text().trim();

      const workModeBadge =
        $(el)
          .find(
            '.inline-flex.items-center.px-2.py-0\\.5.rounded'
          )
          .first()
          .text()
          .trim()
          .toLowerCase();

      let workMode:
        | 'remote'
        | 'hybrid'
        | 'onsite'
        | undefined;

      if (
        workModeBadge.includes('remote')
      ) {
        workMode = 'remote';
      } else if (
        workModeBadge.includes('hybrid')
      ) {
        workMode = 'hybrid';
      } else if (
        workModeBadge.includes('onsite')
      ) {
        workMode = 'onsite';
      }

      const tags =
        $(el)
          .find(
            '.rounded-full.text-xs'
          )
          .map((_, tag) =>
            $(tag).text().trim()
          )
          .get()
          .filter(Boolean);

      const description =
        stripHtml(
          $(el)
            .find(
              '.mt-4.text-sm.text-gray-600'
            )
            .first()
            .text()
            .trim()
        );

      const postedText =
        $(el)
          .find(
            '.text-xs.text-gray-400'
          )
          .first()
          .text()
          .trim();

      jobs.push({
        title,

        company,

        location,

        remote:
          workMode === 'remote',

        workMode,

        employmentType,

        url,

        source: 'jsgurujobs',

        sourceType: 'scraper',

        sourcePlatform:
          'jsgurujobs',

        description,

        tags,

        metadata: {
          salary,
          postedText,
          scraped: true,
        },
      });
    });

  return {
    jobs,
  };
}