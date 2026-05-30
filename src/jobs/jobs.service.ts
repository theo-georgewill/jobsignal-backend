import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { CompanyResolutionService } from '../company/services/company-resolution.service';
function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`
      .replace(/\/$/, '')
      .toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private companyResolutionService: CompanyResolutionService,
  ) {}

  /* =========================================
     CREATE (UPSERT WITH COMPANY + HASH)
  ========================================= */

  async create(data: CreateJobDto) {
    const cleanUrl = normalizeUrl(data.url);

    const company = await this.companyResolutionService.resolve({
      name: data.company,
    });

    return this.upsertJob(
      data,
      company.id,
      cleanUrl,
    );
 
  }

  async createForCompany(
    companyId: string,
    data: CreateJobDto,
  ) {
    const cleanUrl = normalizeUrl(data.url);

    return this.upsertJob(
      data,
      companyId,
      cleanUrl,
    );
  }

  private async upsertJob(
    data: CreateJobDto,
    companyId: string,
    cleanUrl: string,
  ) {
    const hash = this.generateHash(
      {
        ...data,
        url: cleanUrl,
      },
      companyId,
    );

    return this.prisma.job.upsert({
      where: {
        hash,
      },

      update: {
        title: data.title,

        location: data.location,

        remote: data.remote ?? true,

        workMode: data.workMode,

        employmentType:
          data.employmentType,

        url: cleanUrl,

        source: data.source,

        externalId:
          data.externalId,

        description:
          data.description,

        descriptionHtml:
          data.descriptionHtml,

        salaryMin:
          data.salaryMin,

        salaryMax:
          data.salaryMax,

        salaryCurrency:
          data.salaryCurrency,

        salaryPeriod:
          data.salaryPeriod,

        tags:
          data.tags || [],

        postedAt:
          data.postedAt,

        metadata:
          data.metadata as Prisma.InputJsonValue,

        companyId,
      },

      create: {
        title: data.title,

        location: data.location,

        remote: data.remote ?? true,

        workMode: data.workMode,

        employmentType:
          data.employmentType,

        url: cleanUrl,

        source: data.source,

        externalId:
          data.externalId,

        description:
          data.description,

        descriptionHtml:
          data.descriptionHtml,

        salaryMin:
          data.salaryMin,

        salaryMax:
          data.salaryMax,

        salaryCurrency:
          data.salaryCurrency,

        salaryPeriod:
          data.salaryPeriod,

        tags:
          data.tags || [],

        postedAt:
          data.postedAt,

        metadata:
          data.metadata as Prisma.InputJsonValue,

        companyId,

        hash,
      },
    });
  }
  /* =========================================
     HASH (DEDUP STRATEGY)
  ========================================= */

  generateHash(job: any, companyId: string) {
    const base = `${job.title}-${companyId}-${job.location ?? ''}-${job.url}`;
    return crypto.createHash('sha256').update(base).digest('hex');
  }

  /* =========================================
     FIND ALL (UPDATED SEARCH)
  ========================================= */

  async findAll(query: QueryJobsDto) {
    const { search, role, page = 1, limit = 12 } = query;

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                {
                  company: {
                    name: {
                      contains: search,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              ],
            }
          : {},

        role && role.trim() !== ''
          ? {
              OR: [
                { title: { contains: role, mode: 'insensitive' as const } },
                {
                  description: { contains: role, mode: 'insensitive' as const },
                },
              ],
            }
          : {},
      ],
    };

    const [jobs, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          company: true,
        },
      }),
      this.prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
      include: { company: true },
    });
  }

  async findByCompany(companyId: string) {
    return this.prisma.job.findMany({
      where: {
        companyId,
      },
      include: {
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
