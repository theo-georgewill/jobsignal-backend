import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        ...data,
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
}