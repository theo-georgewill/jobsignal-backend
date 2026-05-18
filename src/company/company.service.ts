import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  getLogoUrl,
  normalizeCompanyName,
} from '../common/utils/company.util';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompanyService {
  constructor(
    private prisma: PrismaService
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

  create(data: CreateCompanyDto) {
    const normalizedName =
      normalizeCompanyName(
        data.name,
      );
    return this.prisma.company.create({
      data: {
        ...data,
        name: normalizedName,
        logoUrl:
          getLogoUrl(
            data.website
          ),
      },
    });
  }

  update(
    id: string,
    data: UpdateCompanyDto
  ) {
    return this.prisma.company.update({
      where: { id },
      data: {
        ...data,
        name: data.name
          ? normalizeCompanyName(
              data.name,
            )
          : undefined,
        logoUrl:
          getLogoUrl(
            data.website
          ),
      },
    });
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
          logoUrl:
            getLogoUrl(
              row.website
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
          logoUrl:
            getLogoUrl(
              row.website
            ),
        },
      });

      created++;
    }

    return {
      message:
        'Import complete',
      count: created,
    };
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

    return {
      message:
        'Run completed',
      company:
        company.name,
    };
  }

  async refreshAllLogos() {
    const companies =
      await this.prisma.company.findMany();

    for (const company of companies) {
      await this.prisma.company.update({
        where: { id: company.id },
        data: {
          logoUrl: getLogoUrl(
            company.website
          ),
        },
      });
    }

    return {
      message: 'Logos refreshed',
      count: companies.length,
    };
  }
}