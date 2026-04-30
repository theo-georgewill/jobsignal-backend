import { fetchArbeitnowJobs } from './sources/arbeitnow.source';
import { fetchRemotiveJobs } from './sources/remotive.source';
import { fetchRemoteOKJobs } from './sources/remoteok.source';

import { scrapeWeWorkRemotely } from './scrapers/boards/weworkremotely.scraper';
import { scrapeJSGuruJobs } from './scrapers/boards/jsgurujobs.scraper';

export const SOURCE_REGISTRY = [
  {
    name: 'arbeitnow',
    type: 'api',
    runner: fetchArbeitnowJobs,
  },
  {
    name: 'remotive',
    type: 'api',
    runner: fetchRemotiveJobs,
  },
  {
    name: 'remoteok',
    type: 'api',
    runner: fetchRemoteOKJobs,
  },
  {
    name: 'weworkremotely',
    type: 'scraper',
    runner:
      scrapeWeWorkRemotely,
  },
  {
    name: 'jsgurujobs',
    type: 'scraper',
    runner:
      scrapeJSGuruJobs,
  },
];