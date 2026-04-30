import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';

function normalizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`
      .replace(/\/$/, "")
      .toLowerCase();
  } catch {
    return url.trim().toLowerCase();
  }
}
@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateJobDto) {
    const cleanUrl = normalizeUrl(data.url);

    const existing =
      await this.prisma.job.findFirst({
        where: {
          url: cleanUrl,
        },
      });

    if (existing) {
      return existing;
    }

    return this.prisma.job.create({
      data: {
        ...data,
        url: cleanUrl,
        tags: data.tags || [],
      },
    });
  }

  async findAll(query: QueryJobsDto) {
    const { search, role, page = 1, limit = 12 } = query;

    const skip = (page - 1) * limit;

    const where = {
      AND: [
        search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { company: { contains: search, mode: 'insensitive' as const } },
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
    });
  }

  async removeDuplicates() {
    const jobs =
      await this.prisma.job.findMany({
        orderBy: {
          createdAt: "asc",
        },
      });

    const seen = new Set<string>();
    let removed = 0;

    for (const job of jobs) {
      const key = normalizeUrl(job.url);

      if (seen.has(key)) {
        await this.prisma.job.delete({
          where: { id: job.id },
        });

        removed++;
        continue;
      }

      seen.add(key);
    }

    return {
      message: "Duplicate jobs removed",
      removed,
    };
  }
}