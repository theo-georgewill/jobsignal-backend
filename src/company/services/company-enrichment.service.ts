import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import {
  getLogoUrl,
  normalizeCompanyName,
} from '../../common/utils/company.util';

import { IngestionQueue } from '../../queues/ingestion.queue';

@Injectable()
export class CompanyEnrichmentService {
  private readonly logger = new Logger(CompanyEnrichmentService.name);

  constructor(
    private prisma: PrismaService,
    private ingestionQueue: IngestionQueue,
  ) {}

  private logStep(companyId: string, step: string, data?: unknown) {
    const message = `[COMPANY:${companyId}] ${step}${
      data ? ` | ${JSON.stringify(data)}` : ''
    }`;

    this.logger.log(message);

    console.log(message);
  }

  async enrich(companyId: string) {
    const startedAt = Date.now();

    const logStep = (step: string, data?: unknown) => {
      const message = `[COMPANY:${companyId}] ${step}${
        data ? ` | ${JSON.stringify(data)}` : ''
      }`;

      this.logger.log(message);

      console.log(message);
    };

    logStep('ENRICHMENT_STARTED');

    const company = await this.prisma.company.findUnique({
      where: {
        id: companyId,
      },
    });

    if (!company) {
      logStep('COMPANY_NOT_FOUND');

      return;
    }

    logStep('COMPANY_FETCHED', {
      name: company.name,
      website: company.website,
    });

    try {
      /* =========================================
        MARK ENRICHING
      ========================================= */

      logStep('MARKING_ENRICHING');

      await this.prisma.company.update({
        where: {
          id: company.id,
        },

        data: {
          healthy: true,
          lastCheckedAt: new Date(),
        },
      });

      /* =========================================
        NORMALIZE NAME
      ========================================= */

      logStep('NORMALIZING_NAME');

      const normalizedName = normalizeCompanyName(company.name);

      /* =========================================
        DOMAIN
      ========================================= */

      logStep('NORMALIZING_WEBSITE');

      const website = this.normalizeWebsite(company.website);

      logStep('WEBSITE_NORMALIZED', {
        website,
      });

      const domain = this.extractDomain(website);

      logStep('DOMAIN_EXTRACTED', {
        domain,
      });

      /* =========================================
        LOGO
      ========================================= */

      const logoUrl = website ? getLogoUrl(website) : null;

      logStep('LOGO_GENERATED', {
        logoUrl,
      });

      /* =========================================
        CAREERS URL
      ========================================= */

      let careersUrl = company.careersUrl;

      if (!careersUrl && website) {
        careersUrl = this.detectCareersUrl(website);
      }

      logStep('CAREERS_DETECTED', {
        careersUrl,
      });

      /* =========================================
        ATS DETECTION
      ========================================= */

      let atsType = company.atsType;

      if (!atsType && careersUrl) {
        atsType = this.detectAtsType(careersUrl);
      }

      logStep('ATS_DETECTED', {
        atsType,
      });

      /* =========================================
        HEALTH
      ========================================= */

      const healthy = Boolean(website || careersUrl);

      logStep('HEALTH_COMPUTED', {
        healthy,
      });

      /* =========================================
        UPDATE COMPANY
      ========================================= */

      logStep('UPDATING_COMPANY');

      const updatedCompany = await this.prisma.company.update({
        where: {
          id: company.id,
        },

        data: {
          name: normalizedName,
          website,
          logoUrl,
          careersUrl,
          atsType,
          healthy,
          lastCheckedAt: new Date(),
        },
      });

      logStep('COMPANY_UPDATED');

      /* =========================================
        COMPANY LOG
      ========================================= */

      logStep('CREATING_COMPANY_LOG');

      await this.prisma.companyLog.create({
        data: {
          companyId: updatedCompany.id,

          level: 'healthy',

          message: this.buildSuccessLog(
            updatedCompany.name,
            domain,
            careersUrl,
            atsType,
          ),
        },
      });

      logStep('COMPANY_LOG_CREATED');

      /* =========================================
        AUTO INGESTION
      ========================================= */

      if (updatedCompany.enabled && updatedCompany.careersUrl) {
        logStep('QUEUEING_INGESTION');

        await this.ingestionQueue.syncCompanyJobs(updatedCompany.id);

        logStep('INGESTION_QUEUED');
      }

      logStep('ENRICHMENT_COMPLETED', {
        durationMs: Date.now() - startedAt,
      });
    } catch (error) {
      this.logger.error(
        `[COMPANY:${company.id}] ENRICHMENT_FAILED: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        error instanceof Error ? error.stack : undefined,
      );

      console.error(error);

      await this.prisma.company.update({
        where: {
          id: company.id,
        },

        data: {
          healthy: false,
          lastCheckedAt: new Date(),
        },
      });

      await this.prisma.companyLog.create({
        data: {
          companyId: company.id,

          level: 'error',

          message:
            error instanceof Error
              ? error.message
              : 'Company enrichment failed',
        },
      });
    }
  }

  /* =========================================
     WEBSITE
  ========================================= */

  private normalizeWebsite(website?: string | null) {
    if (!website) {
      return null;
    }

    let normalized = website.trim();

    if (
      !normalized.startsWith('http://') &&
      !normalized.startsWith('https://')
    ) {
      normalized = `https://${normalized}`;
    }

    return normalized;
  }

  /* =========================================
     DOMAIN
  ========================================= */

  private extractDomain(website?: string | null) {
    if (!website) {
      return null;
    }

    try {
      const url = new URL(website);

      return url.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  /* =========================================
     CAREERS URL
  ========================================= */

  private detectCareersUrl(website: string) {
    const base = website.replace(/\/$/, '');

    const commonPaths = [
      '/careers',
      '/jobs',
      '/careers/jobs',
      '/join-us',
      '/work-with-us',
    ];

    return `${base}${commonPaths[0]}`;
  }

  /* =========================================
     ATS DETECTION
  ========================================= */

  private detectAtsType(careersUrl: string) {
    const url = careersUrl.toLowerCase();

    if (url.includes('greenhouse.io')) {
      return 'GREENHOUSE';
    }

    if (url.includes('lever.co')) {
      return 'LEVER';
    }

    if (url.includes('ashbyhq.com')) {
      return 'ASHBY';
    }

    if (url.includes('workday.com')) {
      return 'WORKDAY';
    }

    return 'CUSTOM';
  }

  /* =========================================
     LOG MESSAGE
  ========================================= */

  private buildSuccessLog(
    companyName: string,
    domain: string | null,
    careersUrl: string | null,
    atsType: string | null,
  ) {
    const parts: string[] = [];

    parts.push(`Enrichment completed for ${companyName}`);

    if (domain) {
      parts.push(`Domain: ${domain}`);
    }

    if (careersUrl) {
      parts.push('Careers detected');
    }

    if (atsType) {
      parts.push(`ATS: ${atsType}`);
    }

    return parts.join(' • ');
  }
}
