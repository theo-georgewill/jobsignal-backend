import { Prisma } from '@prisma/client';

export class CreateJobDto {
  title!: string;

  company!: string;

  location?: string;

  remote?: boolean;

  workMode?:
    | 'remote'
    | 'hybrid'
    | 'onsite';

  employmentType?: string;

  url!: string;

  source!: string;

  sourceType?:
    | 'ats'
    | 'api'
    | 'scraper'
    | 'rss'
    | 'board';

  sourcePlatform?: string;

  externalId?: string;

  description?: string;

  descriptionHtml?: string;

  salaryMin?: number;

  salaryMax?: number;

  salaryCurrency?: string;

  salaryPeriod?: string;

  tags?: string[];

  postedAt?: Date;

  metadata?: Prisma.JsonObject;
}