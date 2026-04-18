import { Injectable } from '@nestjs/common';
import { JobsService } from '../jobs/jobs.service';
import { fetchArbeitnowJobs } from './sources/arbeitnow.source';
import { fetchRemotiveJobs } from './sources/remotive.source';
import { fetchRemoteOKJobs } from './sources/remoteok.source'; // ✅ added
import { scrapeWeWorkRemotely } from './scrapers/weworkremotely.scraper'; // ✅ fixed
import { IngestedJob } from './types/jobs.types';

@Injectable()
export class IngestionService {
  constructor(private jobsService: JobsService) {}

  // 🔥 MAIN ENTRY POINT
  async ingestAll() {
    console.log('Starting ingestion...');

    const [apiJobs, scrapedJobs] = await Promise.all([
      this.ingestAPISources(),
      this.ingestScrapers(),
    ]);

    const allJobs = [...apiJobs, ...scrapedJobs];

    console.log('Total jobs fetched:', allJobs.length);

    const filteredJobs = this.filterJobs(allJobs);

    console.log('Jobs after filter:', filteredJobs.length);

    await this.saveJobs(filteredJobs);

    console.log('Jobs saved');

    return {
      message: 'All jobs ingested',
      totalFetched: allJobs.length,
      totalSaved: filteredJobs.length,
    };
  }

  
  async ingestAPISources() {
    const results = await Promise.all([
      fetchArbeitnowJobs(),
      fetchRemotiveJobs(),
      fetchRemoteOKJobs(), 
    ]);

    return results.flat();
  }

  // ✅ SCRAPERS
  async ingestScrapers() {
    const results = await Promise.all([
      scrapeWeWorkRemotely(), // ✅ now works
    ]);

    return results.flat();
  }

  // ✅ FILTER (keep simple for now)
  filterJobs(jobs: IngestedJob[]) {
    return jobs.filter((job) => job.remote === true);
  }

  // ✅ SAVE
  async saveJobs(jobs: IngestedJob[]) {
    await Promise.all(
      jobs.map((job) => this.jobsService.create(job))
    );
  }
}