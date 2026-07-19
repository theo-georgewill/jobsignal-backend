import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

import { JobDiscoveryService } from './job-discovery.service';

import { JobEnrichmentService } from './job-enrichment.service';

import { JobsService } from '../../jobs/jobs.service';

@Injectable()
export class CareerPageCheckService {

  constructor(
    private prisma: PrismaService,

    private jobDiscoveryService:
      JobDiscoveryService,

    private jobEnrichmentService:
      JobEnrichmentService,

    private jobsService:
      JobsService,
  ) {}

  async checkCareerPage(
    companyId: string,
  ) {
    const company =
      await this.prisma.company.findUnique({
        where: { id: companyId },
      });

    if (!company) {
      throw new Error(
        'Company not found',
      );
    }

    try {
      const rawJobs =
        await this.jobDiscoveryService
          .discover(company);

      const jobs =
        await this.jobEnrichmentService
          .enrich(
            rawJobs,
            company,
          );

      let saved = 0;

      for (const job of jobs) {
        await this.jobsService
          .createForCompany(
            company.id,
            job,
          );

        saved++;
      }

      await this.prisma.company.update({
        where: {
          id: company.id,
        },

        data: {
          lastCheckedAt:
            new Date(),
          healthy: true,
          crawlError: null,
        },
      });

      await this.prisma.companyLog.create({
        data: {
          companyId:
            company.id,
          level:
            'healthy',
          message:
            `Found ${rawJobs.length} jobs. Saved ${saved} jobs.`,
        },
      });

      return {
        fetched:
          rawJobs.length,
        saved,
      };

    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown error';
      await this.prisma.company.update({
        where: {
          id: company.id,
        },
        data: {
          healthy: false,
          crawlError:
            message,
          lastCheckedAt:
            new Date(),
        },
      });

      await this.prisma.companyLog.create({
        data: {
          companyId:
            company.id,
          level:
            'failed',
          message,
        },
      });
      throw error;
    }
  }
}