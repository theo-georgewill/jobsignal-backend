import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function extractDomain(
  url?: string | null
): string | null {
  if (!url) return null;

  try {
    return new URL(
      url.startsWith('http')
        ? url
        : `https://${url}`
    ).hostname.replace(
      'www.',
      ''
    );
  } catch {
    return url
      .replace(
        /^https?:\/\//,
        ''
      )
      .replace(
        /^www\./,
        ''
      )
      .split('/')[0];
  }
}

function getLogoUrl(
  website?: string | null
): string | null {
  const domain =
    extractDomain(website);

  if (!domain) return null;

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

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

  create(data: any) {
    return this.prisma.company.create({
      data: {
        ...data,
        logoUrl:
          getLogoUrl(
            data.website
          ),
      },
    });
  }

  update(
    id: string,
    data: any
  ) {
    return this.prisma.company.update({
      where: { id },
      data: {
        ...data,
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
    rows: any[]
  ) {
    let created = 0;

    for (const row of rows) {
      await this.prisma.company.upsert({
        where: {
          name: row.name,
        },

        update: {
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
          name: row.name,
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