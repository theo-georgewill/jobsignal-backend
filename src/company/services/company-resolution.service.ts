import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CompanyQueue } from "../../queues/company.queue";
import { DomainDiscoveryService } from "./domain-discovery.service";
import { normalizeCompanyName } from "../../common/utils/company.util";

@Injectable()
export class CompanyResolutionService {
  constructor(
    private prisma: PrismaService,
    private companyQueue: CompanyQueue,
    private domainDiscoveryService: DomainDiscoveryService,
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
       TRY NAME MATCH
    ========================================= */

    let company =
      await this.prisma.company.findUnique({
        where: {
          name: normalizedName,
        },
      });

    if (company) {
      return company;
    }

    /* =========================================
       DISCOVER DOMAIN
    ========================================= */

    const website =
      input.website ||
      await this.domainDiscoveryService.discover(
        normalizedName,
      );

    /* =========================================
       MATCH BY WEBSITE
    ========================================= */

    if (website) {
      company =
        await this.prisma.company.findFirst({
          where: {
            website,
          },
        });

      if (company) {
        return company;
      }
    }

    /* =========================================
       CREATE COMPANY
    ========================================= */

    company =
      await this.prisma.company.create({
        data: {
          name: normalizedName,
          website,
          careersUrl:
            input.careersUrl ||
            '',
          atsType:
            input.atsType ||
            'unknown',
          enabled: true,
          healthy: true,
          tags: [],
        },
      });

    await this.companyQueue.enrich(
      company.id,
    );

    return company;
  }
}