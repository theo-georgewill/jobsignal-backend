import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { normalizeCompanyName } from '../common/utils/company.util';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyQueue } from '../ingestion/queues/company.queue';
import { ImportCompanyDto } from './dto/import-company.dto';
import { ExportCompaniesDto } from './dto/export-company.dto';
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
    const normalizedName = normalizeCompanyName(data.name);
    const company = await this.prisma.company.create({
    data: {
      ...data,
      name: data.name,
      canonicalName:
        normalizedName,
      verified: false,
      resolutionStatus:
        'pending',
    },
    });
    return company;
  }

  async update(id: string, data: UpdateCompanyDto) {
    const company = await this.prisma.company.update({
      where: { id },
      data: {
        ...data,
        name: data.name,
        canonicalName:
          data.name
            ? normalizeCompanyName(
                data.name,
              )
            : undefined,
      },
    });
    if (company.verified) {
      await this.companyQueue.enrich(
        company.id,
      );
    }

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
        createdAt: 'desc',
      },
      take: 50,
    });
  }

  async importCompanies(rows: ImportCompanyDto[]) {
    let created = 0;
    let updated = 0;
    let skipped = 0;
    let invalid = 0;

    const errors: string[] = [];

    for (const row of rows) {
      try {
        if (!row.name?.trim()) {
          invalid++;
          errors.push('Missing company name');
          continue;
        }

        const normalizedName = normalizeCompanyName(
          row.name,
        );

        const companyData = {
          name: row.name,
          canonicalName: normalizedName,
          website: row.website,
          careersUrl: row.careersUrl,
          atsType: row.atsType,
          verified: !!row.website,
          resolutionStatus: row.website
            ? 'resolved'
            : 'pending',
          priority: Number(row.priority || 1),
        };

        const existing =
          await this.prisma.company.findFirst({
            where: {
              OR: [
                {
                  canonicalName: normalizedName,
                },
                {
                  name: row.name,
                },
              ],
            },
          });

        if (existing) {
          await this.prisma.company.update({
            where: {
              id: existing.id,
            },
            data: {
              ...companyData,
              canonicalName: normalizedName,
            },
          });

          updated++;
        } else {
          await this.prisma.company.create({
            data: {
              ...companyData,
              enabled: true,
              healthy: false,
            },
          });

          created++;
        }
      } catch (error) {
        invalid++;

        errors.push(
          `${row.name ?? 'Unknown'}: ${
            error instanceof Error
              ? error.message
              : 'Unknown error'
          }`,
        );
      }
    }

    return {
      created,
      updated,
      skipped,
      invalid,
      errors,
    };
  }

  async backfillCanonicalNames() {
    const companies =
      await this.prisma.company.findMany({
        where: {
          canonicalName: null,
        },
      });

    let updated = 0;
    let merged = 0;
    const errors: string[] = [];

    for (const company of companies) {
      const canonicalName =
        normalizeCompanyName(company.name);

      try {
        const existing =
          await this.prisma.company.findFirst({
            where: {
              canonicalName,
            },
          });

        if (
          existing &&
          existing.id !== company.id
        ) {
          await this.prisma.$transaction(
            async (tx) => {
              await tx.job.updateMany({
                where: {
                  companyId: company.id,
                },
                data: {
                  companyId: existing.id,
                },
              });

              await tx.signal.updateMany({
                where: {
                  companyId: company.id,
                },
                data: {
                  companyId: existing.id,
                },
              });

              await tx.opportunity.updateMany({
                where: {
                  companyId: company.id,
                },
                data: {
                  companyId: existing.id,
                },
              });

              await tx.company.delete({
                where: {
                  id: company.id,
                },
              });
            },
          );

          merged++;
          continue;
        }

        await this.prisma.company.update({
          where: {
            id: company.id,
          },
          data: {
            canonicalName,
          },
        });

        updated++;
      } catch (error) {
        errors.push(
          `${company.name}: ${
            error instanceof Error
              ? error.message
              : 'Unknown error'
          }`,
        );
      }
    }

    return {
      updated,
      merged,
      errors,
    };
  }

  async exportCompanies(
    filters: ExportCompaniesDto,
  ) {
    const companies =
      await this.prisma.company.findMany({
        where: {
          verified:
            filters.verificationStatus === 'verified'
              ? true
              : filters.verificationStatus === 'unverified'
                ? false
                : undefined,
        },

        take: filters.companyCount,
      });

      const headers = [
        'name',
        'website',
        'careersUrl',
        'atsType',
        'verified',
        'healthy',
        'priority',
      ];

      const rows = companies.map(
        (company) => [
          company.name,
          company.website ?? '',
          company.careersUrl ?? '',
          company.atsType ?? '',
          company.verified
            ? 'Yes'
            : 'No',
          company.healthy
            ? 'Yes'
            : 'No',
          company.priority,
        ],
      );

      const csv = [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map(
              (value) =>
                `"${String(value).replace(
                  /"/g,
                  '""',
                )}"`,
            )
            .join(','),
        ),
      ].join('\n');

      return csv;
  }

  async reenrichAll() {
    const companies = await this.prisma.company.findMany({
      where: {
        verified: true,
      },
      select: {
        id: true,
        name: true,
      },
    });
    for (const company of companies) {
      await this.companyQueue.enrich(company.id);
    }
    return {
      message: 'Re-enrichment queued',
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
    const company = await this.prisma.company.findUnique({
      where: { id },
    });
    if (!company) {
      return {
        message: 'Company not found',
      };
    }
    if (!company.verified) {
      return {
        message:
          'Company must be verified before enrichment',
      };
    }
    await this.prisma.company.update({
      where: { id },
      data: {
        lastCheckedAt: new Date(),
        healthy: true,
      },
    });
    await this.prisma.companyLog.create({
      data: {
        companyId: company.id,
        level: 'healthy',
        message: `Manual run triggered for ${company.name}`,
      },
    });
    await this.companyQueue.enrich(company.id);
    return {
      message: 'Run completed',
      company: company.name,
    };
  }

  async checkCareerPage(id: string) {
    const company =
      await this.prisma.company.findUnique({
        where: { id },
      });

    if (!company) {
      return {
        message: 'Company not found',
      };
    }

    if (!company.careersUrl) {
      return {
        message:
          'Company does not have a careers URL',
      };
    }

    if (!company.enabled) {
      return {
        message:
          'Company monitoring is disabled',
      };
    }

    await this.companyQueue.checkCareerPage(
      company.id,
    );

    return {
      message:
        'Career page check queued',
      company: company.name,
    };
  }
}
