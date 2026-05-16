import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import * as crypto from 'crypto';

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
  constructor(private prisma: PrismaService) {}
  
  /* =========================================
     CREATE (UPSERT WITH COMPANY + HASH)
  ========================================= */

  async create(data: CreateJobDto) {
    const cleanUrl = normalizeUrl(data.url);

    const company = await this.resolveCompany(data.company);

    const hash = this.generateHash({
      ...data,
      url: cleanUrl,
    }, company.id);

    return this.prisma.job.upsert({
      where: { hash },
      update: {
        title: data.title,
        location: data.location,
        remote: data.remote ?? true,
        url: cleanUrl,
        source: data.source,
        description: data.description,
        tags: data.tags || [],
        postedAt: data.postedAt,
        metadata: data.metadata,
        companyId: company.id,
      },
      create: {
        title: data.title,
        location: data.location,
        remote: data.remote ?? true,
        url: cleanUrl,
        source: data.source,
        description: data.description,
        tags: data.tags || [],
        postedAt: data.postedAt,
        metadata: data.metadata,
        companyId: company.id,
        hash,
      },
    });
  }

  /* =========================================
     COMPANY RESOLUTION
  ========================================= */

  async resolveCompany(name?: string) {
    const normalized =
      name && name.trim() !== ''
        ? this.normalizeCompanyName(name)
        : 'unknown';

    try {
      return await this.prisma.company.upsert({
        where: { name: normalized },
        update: {},
        create: {
          name: normalized,
          careersUrl: '',
          atsType: 'unknown',
          tags: [],
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        const existing = await this.prisma.company.findUnique({
          where: { name: normalized },
        });

        if (!existing) {
          throw new Error(
            `Company resolution failed after conflict: ${normalized}`
          );
        }

        return existing;
      }

      throw err;
    }
  }

  normalizeCompanyName(name: string) {
    return name
      .toLowerCase()
      .replace(/inc\.?|ltd\.?|llc/g, '')
      .replace(/\s+/g, ' ')
      .trim();
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
                { description: { contains: role, mode: 'insensitive' as const } },
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