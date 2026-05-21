import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class DomainDiscoveryService {
  private readonly logger = new Logger(DomainDiscoveryService.name);

  private readonly COMMON_TLDS = [
    '.com',
    '.io',
    '.ai',
    '.co',
    '.dev',
    '.app',
    '.tech',
    '.net',
    '.org',
  ];

  async discover(companyName: string): Promise<string | null> {
    try {
      this.logger.log(`[DOMAIN] Discovering domain for ${companyName}`);

      const normalized = this.normalizeCompanyName(companyName);

      /* =========================================
         DIRECT GUESSING
      ========================================= */

      const guessed = await this.tryDirectDomains(normalized);

      if (guessed) {
        this.logger.log(`[DOMAIN] Direct match found ${guessed}`);

        return guessed;
      }

      /* =========================================
         SEARCH ENGINE FALLBACK
      ========================================= */

      const searchResult = await this.searchDuckDuckGo(companyName);

      if (searchResult) {
        this.logger.log(`[DOMAIN] Search result matched ${searchResult}`);

        return searchResult;
      }

      this.logger.log(`[DOMAIN] No domain found`);

      return null;
    } catch (error) {
      this.logger.error(
        `[DOMAIN] Discovery failed for ${companyName}`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  /* =========================================
    CANDIDATE GENERATION
  ========================================= */

  private generateCandidates(normalized: string): string[] {
    const prefixes = [''];

    const suffixes = [''];

    const candidates = new Set<string>();

    for (const prefix of prefixes) {
      for (const suffix of suffixes) {
        for (const tld of this.COMMON_TLDS) {
          candidates.add(`https://${prefix}${normalized}${suffix}${tld}`);
        }
      }
    }

    return Array.from(candidates);
  }

  /* =========================================
    DIRECT DOMAIN GUESSING
  ========================================= */

  private async tryDirectDomains(normalized: string): Promise<string | null> {
    const candidates = this.generateCandidates(normalized);

    for (const domain of candidates) {
      const valid = await this.validateWebsite(domain, normalized);

      if (valid) {
        this.logger.log(`[DOMAIN] Validated ${domain}`);

        return domain;
      }
    }

    return null;
  }

  /* =========================================
     SEARCH FALLBACK
  ========================================= */

  private async searchDuckDuckGo(companyName: string): Promise<string | null> {
    try {
      const query = encodeURIComponent(`${companyName} official website`);

      const url = `https://html.duckduckgo.com/html/?q=${query}`;

      const response = await axios.get(url, {
        timeout: 10000,

        headers: {
          'User-Agent': 'Mozilla/5.0 JobSignalBot/1.0',
        },
      });

      const $ = cheerio.load(response.data);

      const links: string[] = [];

      $('a').each((_, element) => {
        const href = $(element).attr('href');

        if (href && href.startsWith('http')) {
          links.push(href);
        }
      });

      const filtered = links.filter(
        (link) =>
          !link.includes('duckduckgo') &&
          !link.includes('linkedin') &&
          !link.includes('facebook') &&
          !link.includes('twitter'),
      );

      if (!filtered.length) {
        return null;
      }

      return filtered[0];
    } catch (error) {
      this.logger.error(
        `[DOMAIN] Search fallback failed`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  /* =========================================
    WEBSITE VALIDATION
  ========================================= */

  private async validateWebsite(
    url: string,
    companyName: string,
  ): Promise<boolean> {
    try {
      const response = await axios.get(url, {
        timeout: 2000,

        headers: {
          'User-Agent': 'Mozilla/5.0 JobSignalBot/1.0',
        },
      });

      if (response.status !== 200) {
        return false;
      }

      const html = response.data;

      const normalizedCompany = this.normalizeCompanyName(companyName);

      const $ = cheerio.load(html);

      const title = $('title').text().toLowerCase();

      const metaDescription =
        $('meta[name="description"]').attr('content')?.toLowerCase() || '';

      const bodyText = $('body').text().toLowerCase();

      const titleMatch =
        this.normalizeCompanyName(title).includes(normalizedCompany);

      const metaMatch =
        this.normalizeCompanyName(metaDescription).includes(normalizedCompany);

      const bodyMatch =
        this.normalizeCompanyName(bodyText).includes(normalizedCompany);

      const score = [titleMatch, metaMatch, bodyMatch].filter(Boolean).length;

      this.logger.log(`[DOMAIN] Validation score for ${url}: ${score}/3`);

      return score >= 2;
    } catch {
      return false;
    }
  }

  /* =========================================
     NORMALIZATION
  ========================================= */

  private normalizeCompanyName(name: string): string {
    return name
      .toLowerCase()

      .replace(/\b(inc|llc|ltd|gmbh|corp|corporation|limited)\b/g, '')

      .replace(/[^a-z0-9]/g, '')

      .trim();
  }
}
