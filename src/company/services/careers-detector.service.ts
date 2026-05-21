import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class CareersDetectorService {
  private readonly logger = new Logger(CareersDetectorService.name);

  private readonly CAREERS_KEYWORDS = [
    'careers',
    'career',
    'jobs',
    'join',
    'join-us',
    'hiring',
    'work-with-us',
    'employment',
    'open-roles',
    'openings',
    'positions',
    'vacancies',
    'team',
  ];

  async detect(website?: string | null): Promise<string | null> {
    if (!website) {
      return null;
    }

    try {
      this.logger.log(`[CAREERS] Fetching ${website}`);

      const response = await axios.get(website, {
        timeout: 10000,

        headers: {
          'User-Agent': 'Mozilla/5.0 JobSignalBot/1.0',
        },
      });

      const html = response.data;

      const $ = cheerio.load(html);

      const candidates: string[] = [];

      $('a').each((_, element) => {
        const href = $(element).attr('href');

        if (!href) {
          return;
        }

        const normalizedHref = href.toLowerCase();

        const isCareersLink = this.CAREERS_KEYWORDS.some((keyword) =>
          normalizedHref.includes(keyword),
        );

        if (!isCareersLink) {
          return;
        }

        const absoluteUrl = this.normalizeUrl(website, href);

        if (absoluteUrl && !candidates.includes(absoluteUrl)) {
          candidates.push(absoluteUrl);
        }
      });

      this.logger.log(`[CAREERS] Found ${candidates.length} candidates`);

      if (!candidates.length) {
        return null;
      }

      const ranked = this.rankCandidates(candidates);

      for (const url of ranked) {
        const valid = await this.validateCareerPage(url);

        if (valid) {
          this.logger.log(`[CAREERS] Selected ${url}`);

          return url;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(
        `[CAREERS] Detection failed for ${website}`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  private normalizeUrl(website: string, href: string): string | null {
    try {
      return new URL(href, website).toString();
    } catch {
      return null;
    }
  }

  private rankCandidates(urls: string[]) {
    return urls.sort((a, b) => {
      return this.scoreUrl(b) - this.scoreUrl(a);
    });
  }

  private scoreUrl(url: string): number {
    let score = 0;

    const lower = url.toLowerCase();

    if (lower.includes('greenhouse')) {
      score += 100;
    }

    if (lower.includes('lever')) {
      score += 100;
    }

    if (lower.includes('ashbyhq')) {
      score += 100;
    }

    if (lower.includes('/careers')) {
      score += 50;
    }

    if (lower.includes('/jobs')) {
      score += 40;
    }

    if (lower.includes('workday')) {
      score += 80;
    }

    return score;
  }

  private async validateCareerPage(url: string): Promise<boolean> {
    try {
      const response = await axios.get(url, {
        timeout: 10000,

        headers: {
          'User-Agent': 'Mozilla/5.0 JobSignalBot/1.0',
        },
      });

      const html = response.data.toLowerCase();

      const indicators = [
        'job',
        'career',
        'opening',
        'position',
        'join our team',
        'apply',
      ];

      return indicators.some((indicator) => html.includes(indicator));
    } catch {
      return false;
    }
  }
}
