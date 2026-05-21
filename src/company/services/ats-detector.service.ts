import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export type AtsProvider =
  | 'GREENHOUSE'
  | 'LEVER'
  | 'ASHBY'
  | 'WORKDAY'
  | 'BAMBOOHR'
  | 'RECRUITEE'
  | 'TEAMTAILOR'
  | 'SMARTRECRUITERS'
  | 'UNKNOWN';

@Injectable()
export class AtsDetectorService {
  private readonly logger = new Logger(AtsDetectorService.name);

  async detect(careersUrl?: string | null): Promise<AtsProvider | null> {
    if (!careersUrl) {
      return null;
    }

    try {
      this.logger.log(`[ATS] Detecting ATS for ${careersUrl}`);

      /* =========================================
         URL-BASED DETECTION
      ========================================= */

      const urlDetection = this.detectFromUrl(careersUrl);

      if (urlDetection) {
        this.logger.log(`[ATS] URL detection matched ${urlDetection}`);

        return urlDetection;
      }

      /* =========================================
         FETCH PAGE
      ========================================= */

      const response = await axios.get(careersUrl, {
        timeout: 10000,

        headers: {
          'User-Agent': 'Mozilla/5.0 JobSignalBot/1.0',
        },
      });

      const html = response.data;

      const lowerHtml = html.toLowerCase();

      const $ = cheerio.load(html);

      /* =========================================
         HTML DETECTION
      ========================================= */

      const htmlDetection = this.detectFromHtml(lowerHtml);

      if (htmlDetection) {
        this.logger.log(`[ATS] HTML detection matched ${htmlDetection}`);

        return htmlDetection;
      }

      /* =========================================
         SCRIPT DETECTION
      ========================================= */

      const scriptDetection = this.detectFromScripts($);

      if (scriptDetection) {
        this.logger.log(`[ATS] Script detection matched ${scriptDetection}`);

        return scriptDetection;
      }

      this.logger.log(`[ATS] No ATS detected`);

      return 'UNKNOWN';
    } catch (error) {
      this.logger.error(
        `[ATS] Detection failed for ${careersUrl}`,
        error instanceof Error ? error.stack : undefined,
      );

      return null;
    }
  }

  /* =========================================
     URL DETECTION
  ========================================= */

  private detectFromUrl(url: string): AtsProvider | null {
    const lower = url.toLowerCase();

    if (lower.includes('greenhouse.io')) {
      return 'GREENHOUSE';
    }

    if (lower.includes('lever.co')) {
      return 'LEVER';
    }

    if (lower.includes('ashbyhq.com')) {
      return 'ASHBY';
    }

    if (lower.includes('myworkdayjobs.com')) {
      return 'WORKDAY';
    }

    if (lower.includes('bamboohr.com')) {
      return 'BAMBOOHR';
    }

    if (lower.includes('recruitee.com')) {
      return 'RECRUITEE';
    }

    if (lower.includes('teamtailor.com')) {
      return 'TEAMTAILOR';
    }

    if (lower.includes('smartrecruiters.com')) {
      return 'SMARTRECRUITERS';
    }

    return null;
  }

  /* =========================================
     HTML DETECTION
  ========================================= */

  private detectFromHtml(html: string): AtsProvider | null {
    if (html.includes('greenhouse.io')) {
      return 'GREENHOUSE';
    }

    if (html.includes('jobs.lever.co')) {
      return 'LEVER';
    }

    if (html.includes('ashbyhq.com')) {
      return 'ASHBY';
    }

    if (html.includes('myworkdayjobs')) {
      return 'WORKDAY';
    }

    if (html.includes('bamboohr')) {
      return 'BAMBOOHR';
    }

    if (html.includes('recruitee')) {
      return 'RECRUITEE';
    }

    if (html.includes('teamtailor')) {
      return 'TEAMTAILOR';
    }

    if (html.includes('smartrecruiters')) {
      return 'SMARTRECRUITERS';
    }

    return null;
  }

  /* =========================================
     SCRIPT DETECTION
  ========================================= */

  private detectFromScripts($: cheerio.CheerioAPI): AtsProvider | null {
    const scripts: string[] = [];

    $('script').each((_, element) => {
      const src = $(element).attr('src');

      if (src) {
        scripts.push(src.toLowerCase());
      }
    });

    for (const script of scripts) {
      if (script.includes('greenhouse')) {
        return 'GREENHOUSE';
      }

      if (script.includes('lever')) {
        return 'LEVER';
      }

      if (script.includes('ashby')) {
        return 'ASHBY';
      }

      if (script.includes('workday')) {
        return 'WORKDAY';
      }

      if (script.includes('bamboohr')) {
        return 'BAMBOOHR';
      }

      if (script.includes('recruitee')) {
        return 'RECRUITEE';
      }

      if (script.includes('teamtailor')) {
        return 'TEAMTAILOR';
      }

      if (script.includes('smartrecruiters')) {
        return 'SMARTRECRUITERS';
      }
    }

    return null;
  }
}
