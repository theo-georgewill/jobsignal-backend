import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyResolutionService } from '../company/services/company-resolution.service';
import { normalizeCompanyName } from '../ingestion/utils/company-normalizer';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as crypto from 'crypto';
import pLimit from 'p-limit';
import { Prisma } from '@prisma/client';

interface IncomingSignal {
  type: string;
  title: string;
  url?: string;
  source: string;
  payload?: Prisma.InputJsonValue;
  companyName: string;
}

@Injectable()
export class SignalsService {
  constructor(
    private prisma: PrismaService,
    private companyResolutionService: CompanyResolutionService,
    @InjectQueue('opportunities')
    private opportunitiesQueue: Queue,
  ) {}

  async createMany(signals: IncomingSignal[]) {
    if (!signals.length) return;

    const limit = pLimit(10);

    await Promise.all(
      signals.map((signal) =>
        limit(async () => {
          const processed = this.processIncoming(signal);

          // 🔴 DROP BAD SIGNALS EARLY
          if (!processed) return;

          const company = await this.companyResolutionService.resolve({
            name: processed.companyName,
          });

          const hash = this.generateHash(processed, processed.companyName);

          let created;
          let isNew = true;

          const basePayload =
            processed.payload &&
            typeof processed.payload === 'object' &&
            !Array.isArray(processed.payload)
              ? processed.payload
              : {};

          try {
            created = await this.prisma.signal.upsert({
              where: { hash },
              update: {},
              create: {
                type: processed.type,
                title: processed.title,
                url: processed.url,
                source: processed.source,
                payload: {
                  ...basePayload,
                  score: processed.score,
                  confidence: processed.confidence,
                  amount: processed.amount,
                },
                companyId: company.id,
                companyName: processed.companyName,
                rawCompanyName: signal.companyName,
                hash,
              },
            });
          } catch (err: any) {
            if (err.code === 'P2002') {
              isNew = false;

              created = await this.prisma.signal.findUnique({
                where: { hash },
              });

              if (!created) {
                throw new Error(`Signal conflict but not found: ${hash}`);
              }
            } else {
              throw err;
            }
          }

          if (isNew && processed.score >= 7) {
            await this.opportunitiesQueue.add('recompute', {
              companyId: company.id,
            });
          }

          return created;
        }),
      ),
    );
  }

  /* =========================================
     CORE PROCESSING (NEW)
  ========================================= */

  private processIncoming(signal: IncomingSignal) {
    const normalizedName = normalizeCompanyName(signal.companyName);

    if (!normalizedName || normalizedName.length < 2) {
      return null;
    }

    const type = this.normalizeType(signal.type);
    if (!type) return null;

    const amount = this.extractAmount(signal.title);

    const confidence = this.computeConfidence(signal, normalizedName, amount);

    const score = this.computeScore(type, amount, confidence);

    // HARD FILTER
    if (score < 6) return null;

    return {
      ...signal,
      type,
      companyName: normalizedName,
      amount,
      confidence,
      score,
    };
  }

  private normalizeType(type: string) {
    const t = type.toLowerCase();

    if (t.includes('fund') || t.includes('raise') || t.includes('investment')) {
      return 'funding';
    }

    if (t.includes('hiring') || t.includes('job')) {
      return 'hiring';
    }

    if (t.includes('expand') || t.includes('launch') || t.includes('enter')) {
      return 'expansion';
    }

    if (t.includes('partner')) {
      return 'partnership';
    }

    return null;
  }

  private extractAmount(title: string): number | null {
    const match = title.match(/\$?([0-9]+(\.[0-9]+)?)(m|million)?/i);

    if (!match) return null;

    let value = parseFloat(match[1]);

    if (match[3]) value *= 1_000_000;

    return value;
  }

  private computeConfidence(
    signal: IncomingSignal,
    company: string,
    amount: number | null,
  ) {
    let confidence = 0;

    if (company) confidence += 0.4;
    if (signal.type) confidence += 0.3;
    if (amount) confidence += 0.3;

    return confidence;
  }

  private computeScore(
    type: string,
    amount: number | null,
    confidence: number,
  ) {
    let score = 0;

    if (type === 'funding') score += 5;
    if (type === 'expansion') score += 3;
    if (type === 'partnership') score += 2;
    if (type === 'hiring') score += 2;

    if (amount) {
      score += Math.log10(amount);
    }

    if (confidence > 0.7) score += 2;

    return score;
  }

  /* =========================================
     HASH (DEDUP)
  ========================================= */

  generateHash(signal: IncomingSignal, normalizedName: string) {
    const base = `${normalizedName}-${signal.title}-${signal.source}-${signal.url ?? ''}`;
    return crypto.createHash('sha256').update(base).digest('hex');
  }
}
