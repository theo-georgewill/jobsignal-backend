import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Processor('opportunities')
export class OpportunitiesProcessor extends WorkerHost {
  constructor(private prisma: PrismaService) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'recompute') {
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

      const seen = new Set<string>();

      const uniqueSignals = signals.filter((s) => {
        if (seen.has(s.hash)) return false;
        seen.add(s.hash);
        return true;
      });

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

      let momentum: 'up' | 'stable' | 'down' = 'stable';

      if (momentumScore > 2) momentum = 'up';
      else if (momentumScore < -2) momentum = 'down';

      const counts: Record<string, number> = {};
      const explanation: string[] = [];

      for (const s of uniqueSignals) {
        counts[s.type] = (counts[s.type] || 0) + 1;
      }

      const SIGNAL_WEIGHTS: Record<string, number> = {
        funding: 50,
        hiring: 40,
        news: 20,
      };

      let score = 0;

      for (const signal of uniqueSignals) {
        const weight = SIGNAL_WEIGHTS[signal.type] ?? 0;

        const ageHours =
          (Date.now() - signal.createdAt.getTime()) /
          (1000 * 60 * 60);

        // Simple recency decay (no helper function needed)
        let multiplier = 1;

        if (ageHours > 24) {
          const days = ageHours / 24;
          multiplier = Math.max(0.3, 1 - (days - 1) / 6);
        }

        score += weight * multiplier;
      }

      // Light normalization (prevents runaway scores)
      score = Math.round(Math.sqrt(score) * 10);

      let priority: 'high' | 'medium' | 'low' = 'low';

      if (score >= 80) priority = 'high';
      else if (score >= 40) priority = 'medium';

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
          (Date.now() - latest.createdAt.getTime()) /
          (1000 * 60 * 60);

        if (hours < 24) {
          explanation.push('Very recent activity');
        }
      }

      await this.prisma.opportunity.upsert({
        where: { companyId },
        update: { score, priority, momentum },
        create: {
          companyId,
          score,
          priority,
          momentum,
          summary: explanation.join(' • ') || `${uniqueSignals.length} recent signals (last 30 days)`,
        },
      });
    }
  }
}