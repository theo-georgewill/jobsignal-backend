import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OpportunitiesService {
  constructor(private prisma: PrismaService) {}

  /* =========================================
     GET ALL OPPORTUNITIES
  ========================================= */

  async findAll() {
    const opportunities = await this.prisma.opportunity.findMany({
      include: {
        company: true,
      },
      orderBy: {
        score: 'desc',
      },
      take: 20,
    });

    return opportunities.map((o) => ({
      id: o.id,
      companyId: o.companyId,
      companyName: o.company.name,
      logo: o.company.logoUrl,
      tags: o.company.tags,

      score: o.score,
      priority: o.priority,
      momentum: o.momentum,
      summary: o.summary,
    }));
  }

  /* =========================================
     GET ONE COMPANY OPPORTUNITY
  ========================================= */

  async findByCompany(companyId: string) {
    const o = await this.prisma.opportunity.findUnique({
      where: { companyId },
      include: {
        company: true,
      },
    });

    if (!o) return null;

    return {
      id: o.id,
      companyId: o.companyId,
      companyName: o.company.name,
      logo: o.company.logoUrl,
      tags: o.company.tags,

      score: o.score,
      priority: o.priority,
      momentum: o.momentum,
      summary: o.summary,
    };
  }
}