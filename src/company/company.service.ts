import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  getLogoUrl,
  normalizeCompanyName,
} from '../common/utils/company.util';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueue } from '../queues/company.queue';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService,
    private companyQueue: CompanyQueue,
  ) {}

  findAll() {
    return this.prisma.company.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.company.findUnique({
      where: { id },
    });
  }

  async create(data: CreateCompanyDto) {
    const normalizedName =
      normalizeCompanyName(
        data.name,
      );
    const company = await this.prisma.company.create({
      data: {
        ...data,
        name: normalizedName,
      },
    });
    await this.companyQueue.enrich(
      company.id,
    );
    return company;
  }

  async update(
    id: string,
    data: UpdateCompanyDto
  ) {
    const company = await this.prisma.company.update({
      where: { id },
      data: {
        ...data,
        name: data.name
          ? normalizeCompanyName(
              data.name,
            )
          : undefined,
      },
    });

    await this.companyQueue.enrich(
      company.id,
    );

    return company;
  }

  remove(id: string) {
    return this.prisma.company.delete({
      where: { id },
    });
  }

  logs(id: string) {
    return this.prisma.companyLog.findMany({
      where: {
        companyId: id,
      },
      orderBy: {
        createdAt:
          'desc',
      },
      take: 50,
    });
  }

  async bulkImport(
    rows: CreateCompanyDto[]
  ) {
    let created = 0;

    for (const row of rows) {
      const normalizedName =
        normalizeCompanyName(
          row.name,
        );

      const company = 
        await this.prisma.company.upsert({
          where: {
            name: normalizedName,
          },

          update: {
            name: 
              normalizedName,
            website:
              row.website,
            careersUrl:
              row.careersUrl,
            atsType:
              row.atsType,
            priority:
              Number(
                row.priority ||
                  1
              ),
          },

          create: {
            name: normalizedName,
            website:
              row.website,
            careersUrl:
              row.careersUrl,
            atsType:
              row.atsType,
            enabled: true,
            healthy: true,
            priority:
              Number(
                row.priority ||
                  1
              ),
          },
        });

      await this.companyQueue.enrich(
        company.id,
      );

      created++;
    }

    return {
      message:
        'Import complete',
      count: created,
    };
  }

  async reenrichAll() {
    const companies =
      await this.prisma.company.findMany({
        select: {
          id: true,
          name: true,
        },
      });

    for (const company of companies) {
      await this.companyQueue.enrich(
        company.id,
      );
    }

    return {
      message:
        'Re-enrichment queued',
      count: companies.length,
    };
  }

  async findCompanyPage(id: string) {
    return this.prisma.company.findUnique({
      where: { id },

      include: {
        jobs: {
          orderBy: {
            postedAt: 'desc',
          },

          take: 20,
        },

        opportunities: {
          orderBy: {
            score: 'desc',
          },

          take: 20,
        },

        signals: {
          orderBy: {
            createdAt: 'desc',
          },

          take: 20,
        },
      },
    });
  }

  async run(id: string) {
    const company =
      await this.prisma.company.findUnique({
        where: { id },
      });

    if (!company) {
      return {
        message:
          'Company not found',
      };
    }

    await this.prisma.company.update({
      where: { id },
      data: {
        lastCheckedAt:
          new Date(),
        healthy: true,
      },
    });

    await this.prisma.companyLog.create({
      data: {
        companyId:
          company.id,
        level:
          'healthy',
        message: `Manual run triggered for ${company.name}`,
      },
    });

    await this.companyQueue.enrich(
      company.id,
    );

    return {
      message:
        'Run completed',
      company:
        company.name,
    };
  }
}