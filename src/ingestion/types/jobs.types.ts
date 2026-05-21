import { Prisma } from '@prisma/client';
export interface IngestedJob {
  title: string;

  company: string;
  companyLogo?: string;
  companyWebsite?: string;

  location?: string;

  remote: boolean;

  workMode?: 'remote' | 'hybrid' | 'onsite';

  employmentType?: string;

  url: string;

  source: string;

  sourceType?: 'ats' | 'api' | 'scraper' | 'rss';

  sourcePlatform?: string;

  externalId?: string;

  description?: string;

  descriptionHtml?: string;

  salaryMin?: number;

  salaryMax?: number;

  salaryCurrency?: string;

  salaryPeriod?: 'yearly' | 'monthly' | 'hourly';

  postedAt?: Date;

  tags: string[];

  metadata?: Prisma.JsonObject;
}
