import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';

@Processor('opportunities')
export class OpportunitiesProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    if (job.name !== 'recompute') return;

    console.log('Processing recompute:', job.data);

    const { companyId } = job.data;

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const signals = await this.prisma.signal.findMany({
      where: {
        companyId,
        createdAt: {
          gte: since,
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!signals.length) return;

    /* =========================================
       REMOVE DUPLICATES
    ========================================= */

    const seen = new Set<string>();

    const uniqueSignals = signals.filter((s) => {
      if (seen.has(s.hash)) return false;

      seen.add(s.hash);

      return true;
    });

    /* =========================================
       MOMENTUM
    ========================================= */

    const now = Date.now();

    const recentSignals = uniqueSignals.filter((s) => {
      const hours = (now - s.createdAt.getTime()) / (1000 * 60 * 60);

      return hours <= 72;
    });

    const olderSignals = uniqueSignals.filter((s) => {
      const hours = (now - s.createdAt.getTime()) / (1000 * 60 * 60);

      return hours > 72;
    });

    const momentumScore = recentSignals.length - olderSignals.length;

    let momentum: 'TRENDING' | 'RISING' | 'STABLE' = 'STABLE';

    if (momentumScore > 2) {
      momentum = 'TRENDING';
    } else if (momentumScore > 0) {
      momentum = 'RISING';
    }

    /* =========================================
       SIGNAL COUNTS
    ========================================= */

    const counts: Record<string, number> = {};

    for (const signal of uniqueSignals) {
      counts[signal.type] = (counts[signal.type] || 0) + 1;
    }

    /* =========================================
       SCORING
    ========================================= */

    const SIGNAL_WEIGHTS: Record<string, number> = {
      funding: 50,
      hiring: 40,
      news: 20,
    };

    let score = 0;

    for (const signal of uniqueSignals) {
      const weight = SIGNAL_WEIGHTS[signal.type] ?? 0;

      const ageHours =
        (Date.now() - signal.createdAt.getTime()) / (1000 * 60 * 60);

      let multiplier = 1;

      if (ageHours > 24) {
        const days = ageHours / 24;

        multiplier = Math.max(0.3, 1 - (days - 1) / 6);
      }

      score += weight * multiplier;
    }

    score = Math.round(Math.sqrt(score) * 10);

    /* =========================================
       PRIORITY
    ========================================= */

    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

    if (score >= 80) {
      priority = 'HIGH';
    } else if (score >= 40) {
      priority = 'MEDIUM';
    }

    /* =========================================
       EXPLANATION
    ========================================= */

    const explanation: string[] = [];

    if (counts.funding) {
      explanation.push(`Funding (${counts.funding})`);
    }

    if (counts.hiring) {
      explanation.push(`Hiring (${counts.hiring})`);
    }

    if (counts.news) {
      explanation.push(`News (${counts.news})`);
    }

    const latest = uniqueSignals[0];

    if (latest) {
      const hours =
        (Date.now() - latest.createdAt.getTime()) / (1000 * 60 * 60);

      if (hours < 24) {
        explanation.push('Very recent activity');
      }
    }

    /* =========================================
       CREATE OPPORTUNITY
    ========================================= */

    const title =
      explanation.join(' • ') || `${uniqueSignals.length} recent signals`;

    const hash = createHash('sha256')
      .update(`${companyId}-${title}-${priority}`)
      .digest('hex');

    await this.prisma.opportunity.upsert({
      where: {
        hash,
      },

      update: {
        score,
        priority,
        momentum,
      },

      create: {
        companyId,

        title,

        type: 'JOB',

        hash,

        score,

        priority,

        momentum,

        metadata: {
          signalCounts: counts,
          totalSignals: uniqueSignals.length,
        },
      },
    });
  }
}
