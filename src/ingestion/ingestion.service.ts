import { Injectable, OnModuleInit } from '@nestjs/common';

import { JobsService } from '../jobs/jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignalsService } from '../signals/signals.service';

import { IngestedJob } from './types/jobs.types';
import { PROVIDER_REGISTRY } from './registry/provider-registry';

@Injectable()
export class IngestionService implements OnModuleInit {
  constructor(
    private jobsService: JobsService,
    private prisma: PrismaService,
    private signalsService: SignalsService,
  ) {}

  /* =========================================
     ENGINE STATE
  ========================================= */

  async getEngine() {
    let engine = await this.prisma.ingestionEngine.findFirst();

    if (!engine) {
      engine = await this.prisma.ingestionEngine.create({
        data: {},
      });
    }

    return engine;
  }

  async setRunning(running: boolean) {
    const engine = await this.getEngine();

    await this.prisma.ingestionEngine.update({
      where: {
        id: engine.id,
      },
      data: {
        running,
      },
    });
  }

  /* =========================================
     MAIN ENTRY POINT
  ========================================= */

  async ingestAll() {
    const engine = await this.getEngine();

    if (engine.paused) {
      return {
        message: 'Engine is paused',
      };
    }

    if (engine.running) {
      return {
        message: 'Engine already running',
      };
    }

    await this.setRunning(true);

    const run = await this.prisma.ingestionRun.create({
      data: {
        sourceName: 'all',
        status: 'running',
      },
    });

    try {
      console.log('STEP 1: Starting provider ingestion');

      const result = await this.ingestAPISources();

      console.log('STEP 2: Providers completed');

      const allJobs = result.jobs;
      const allSignals = result.signals;

      console.log(`Fetched ${allJobs.length} jobs`);

      console.log(`Fetched ${allSignals.length} signals`);

      console.log('STEP 3: Filtering jobs');

      const filteredJobs = this.filterJobs(allJobs);

      console.log(`Filtered to ${filteredJobs.length} remote jobs`);

      console.log('STEP 4: Saving jobs');

      await this.saveJobs(filteredJobs);

      console.log('STEP 5: Jobs saved');

      console.log('STEP 6: Creating signals');

      await this.signalsService.createMany(allSignals);

      console.log('STEP 7: Signals created');

      await this.prisma.ingestionRun.update({
        where: {
          id: run.id,
        },
        data: {
          status: 'completed',
          fetched: allJobs.length,
          saved: filteredJobs.length,
          finishedAt: new Date(),
        },
      });

      return {
        message: 'All jobs ingested',
        totalFetched: allJobs.length,
        totalSaved: filteredJobs.length,
      };
    } catch (error: any) {
      await this.prisma.ingestionRun.update({
        where: {
          id: run.id,
        },
        data: {
          status: 'failed',
          message: error?.message || 'Unknown error',
          finishedAt: new Date(),
        },
      });

      throw error;
    } finally {
      await this.setRunning(false);
    }
  }

  /* =========================================
     SOURCES
  ========================================= */

  async ingestAPISources() {
    const sources = PROVIDER_REGISTRY;

    const results = await Promise.allSettled(sources.map((s) => s.runner()));

    const jobs: IngestedJob[] = [];
    const signals: any[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      const source = sources[i];

      if (result.status === 'fulfilled') {
        const data = result.value;

        const providerJobs = data.jobs ?? [];
        const providerSignals = data.signals ?? [];

        jobs.push(...providerJobs);
        signals.push(...providerSignals);

        await this.prisma.ingestionSource.update({
          where: {
            name: source.name,
          },
          data: {
            healthy: true,
            lastRunAt: new Date(),
          },
        });
        await this.updateSuccessRate(source.name);
      } else {
        await this.prisma.ingestionLog.create({
          data: {
            level: 'failed',
            sourceName: source.name,
            message: result.reason?.message || 'Unknown error',
          },
        });

        await this.prisma.ingestionSource.update({
          where: {
            name: source.name,
          },
          data: {
            healthy: false,
          },
        });
        await this.updateSuccessRate(source.name);
      }
    }

    return { jobs, signals };
  }

  /* =========================================
     FILTER
  ========================================= */

  filterJobs(jobs: IngestedJob[]) {
    return jobs.filter((job) => job.remote === true);
  }

  /* =========================================
     SAVE
  ========================================= */

  async saveJobs(jobs: IngestedJob[]) {
    await Promise.all(jobs.map((job) => this.jobsService.create(job)));
  }

  /* =========================================
     DASHBOARD
  ========================================= */

  async overview() {
    const engine = await this.getEngine();

    const totalSources = await this.prisma.ingestionSource.count();

    const healthy = await this.prisma.ingestionSource.count({
      where: {
        healthy: true,
      },
    });

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const jobsToday = await this.prisma.ingestionRun.aggregate({
      _sum: {
        saved: true,
      },
      where: {
        startedAt: {
          gte: today,
        },
        status: 'completed',
      },
    });

    const totalJobs = await this.prisma.job.count();

    return {
      totalSources,
      healthy,
      running: engine.running ? 1 : 0,
      paused: engine.paused,
      jobsToday: jobsToday._sum.saved || 0,
      totalJobs,
    };
  }

  async sources() {
    const engine = await this.getEngine();

    const rows = await this.prisma.ingestionSource.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      enabled: row.enabled,
      healthy: row.healthy,
      status: engine.paused ? 'paused' : row.healthy ? 'healthy' : 'failed',
      lastRunAt: row.lastRunAt,
      successRate: row.successRate,
    }));
  }

  async status() {
    const engine = await this.getEngine();

    return {
      paused: engine.paused,
      running: engine.running,
    };
  }

  async pause() {
    const engine = await this.getEngine();

    await this.prisma.ingestionEngine.update({
      where: {
        id: engine.id,
      },
      data: {
        paused: true,
      },
    });

    return {
      message: 'Engine paused',
    };
  }

  async resume() {
    const engine = await this.getEngine();

    await this.prisma.ingestionEngine.update({
      where: {
        id: engine.id,
      },
      data: {
        paused: false,
      },
    });

    return {
      message: 'Engine resumed',
    };
  }

  async runSource(name: string) {
    const engine = await this.getEngine();

    if (engine.paused) {
      return {
        message: 'Engine is paused',
      };
    }

    const source = PROVIDER_REGISTRY.find((s) => s.name === name);

    if (!source) {
      return {
        message: 'Unknown source',
      };
    }

    const run = await this.prisma.ingestionRun.create({
      data: {
        sourceName: name,
        status: 'running',
      },
    });

    try {
      const result = await source.runner();
      const jobs = result.jobs ?? [];

      const filtered = this.filterJobs(jobs);

      await this.saveJobs(filtered);

      await this.prisma.ingestionRun.update({
        where: {
          id: run.id,
        },
        data: {
          status: 'completed',
          fetched: jobs.length,
          saved: filtered.length,
          finishedAt: new Date(),
        },
      });

      await this.prisma.ingestionSource.update({
        where: {
          name,
        },
        data: {
          lastRunAt: new Date(),
          healthy: true,
        },
      });
      await this.updateSuccessRate(name);

      return {
        source: name,
        fetched: jobs.length,
        saved: filtered.length,
      };
    } catch (error: any) {
      await this.prisma.ingestionRun.update({
        where: {
          id: run.id,
        },
        data: {
          status: 'failed',
          message: error?.message || 'Unknown error',
          finishedAt: new Date(),
        },
      });
      await this.updateSuccessRate(name);
      throw error;
    }
  }

  async history() {
    return this.prisma.ingestionRun.findMany({
      orderBy: {
        startedAt: 'desc',
      },
      take: 50,
    });
  }

  async logs() {
    return this.prisma.ingestionLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });
  }

  async updateSuccessRate(sourceName: string) {
    const runs = await this.prisma.ingestionRun.findMany({
      where: {
        sourceName,
      },
      orderBy: {
        startedAt: 'desc',
      },
      take: 20,
    });

    if (!runs.length) {
      return;
    }

    const successful = runs.filter((r) => r.status === 'completed').length;

    const rate = Math.round((successful / runs.length) * 100);

    await this.prisma.ingestionSource.update({
      where: {
        name: sourceName,
      },
      data: {
        successRate: rate,
      },
    });
  }

  async syncSources() {
    for (const source of PROVIDER_REGISTRY) {
      await this.prisma.ingestionSource.upsert({
        where: {
          name: source.name,
        },
        update: {
          type: source.type,
        },
        create: {
          name: source.name,
          type: source.type,
          enabled: true,
          healthy: true,
          successRate: 100,
        },
      });
    }

    console.log('Sources synced');
  }

  async onModuleInit() {
    await this.syncSources();
  }
}
