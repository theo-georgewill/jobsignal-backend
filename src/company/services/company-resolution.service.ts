import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { normalizeCompanyName } from '../../common/utils/company.util';

@Injectable()
export class CompanyResolutionService {
  constructor(
    private prisma: PrismaService,
  ) {}

  async resolve(input: {
    name?: string;
    website?: string;
    careersUrl?: string;
    atsType?: string;
  }) {
    if (!input.name) {
      throw new Error(
        'Company name required',
      );
    }

    const normalizedName =
      normalizeCompanyName(
        input.name,
      );

    /* =========================================
       TRY CANONICAL MATCH
    ========================================= */

const company =
  await this.prisma.company.upsert({
    where: {
      canonicalName:
        normalizedName,
    },

    update: {},

    create: {
      name: input.name,

      canonicalName:
        normalizedName,

      website:
        input.website ||
        null,

      careersUrl:
        input.careersUrl ||
        '',

      atsType:
        input.atsType ||
        'unknown',

      verified: false,

      resolutionStatus:
        'pending',

      enabled: true,

      healthy: false,

      tags: [],
    },
  });

return company;
  }
}