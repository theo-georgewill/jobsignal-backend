// ingestion/registry/provider-registry.ts

import { Provider } from '../types/provider.types';

// JOB PROVIDERS
import { fetchArbeitnowJobs } from '../providers/jobs/api/arbeitnow.provider';
import { fetchRemotiveJobs } from '../providers/jobs/api/remotive.provider';
import { fetchRemoteOKJobs } from '../providers/jobs/api/remoteok.provider';

import { scrapeWeWorkRemotely } from '../providers/jobs/boards/weworkremotely.provider';
import { scrapeJSGuruJobs } from '../providers/jobs/boards/jsgurujobs.provider';

// SIGNAL PROVIDERS
import { fetchTechCrunchSignals } from '../providers/signals/techcrunch.provider';
import { fetchTechCabalSignals } from '../providers/signals/techcabal.provider';
import { fetchTechpointSignals } from '../providers/signals/techpoint.provider';

import { fetchGreenhouseJobs } from '../providers/jobs/careers/greenhouse.provider';

export const PROVIDER_REGISTRY: Provider[] = [
  // =========================
  // JOB PROVIDERS
  // =========================
  {
    name: 'arbeitnow',
    type: 'job',
    runner: fetchArbeitnowJobs,
  },
  {
    name: 'remotive',
    type: 'job',
    runner: fetchRemotiveJobs,
  },
  {
    name: 'remoteok',
    type: 'job',
    runner: fetchRemoteOKJobs,
  },
  {
    name: 'weworkremotely',
    type: 'job',
    runner: scrapeWeWorkRemotely,
  },
  {
    name: 'jsgurujobs',
    type: 'job',
    runner: scrapeJSGuruJobs,
  },

  // =========================
  // SIGNAL PROVIDERS
  // =========================
  {
    name: 'techcrunch',
    type: 'signal',
    runner: fetchTechCrunchSignals,
  },
  {
    name: 'techcabal',
    type: 'signal',
    runner: fetchTechCabalSignals,
  },
  {
    name: 'techpoint',
    type: 'signal',
    runner: fetchTechpointSignals,
  },

  // =========================
  // CAREER PAGE PROVIDERS
  // =========================
  {
    name: 'greenhouse',
    type: 'careers',
    runner: fetchGreenhouseJobs,
  },
];
