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

      title: o.title,
      type: o.type,

      companyId: o.companyId,
      companyName: o.company.name,

      logo: o.company.logoUrl,

      tags: o.company.tags,

      remote: o.remote,
      location: o.location,

      score: o.score,
      priority: o.priority,
      momentum: o.momentum,

      url: o.url,

      createdAt: o.createdAt,
    }));
  }

  /* =========================================
     GET COMPANY OPPORTUNITIES
  ========================================= */

  async findByCompany(companyId: string) {
    const opportunities = await this.prisma.opportunity.findMany({
      where: { companyId },

      include: {
        company: true,
      },

      orderBy: {
        score: 'desc',
      },
    });

    return opportunities.map((o) => ({
      id: o.id,

      title: o.title,
      type: o.type,

      companyId: o.companyId,
      companyName: o.company.name,

      logo: o.company.logoUrl,

      tags: o.company.tags,

      remote: o.remote,
      location: o.location,

      score: o.score,
      priority: o.priority,
      momentum: o.momentum,

      url: o.url,

      createdAt: o.createdAt,
    }));
  }
}
