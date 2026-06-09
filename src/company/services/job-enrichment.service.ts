import { Injectable } from '@nestjs/common';
import { Company } from '@prisma/client';
import { CreateJobDto } from '../../jobs/dto/create-job.dto';

@Injectable()
export class JobEnrichmentService {

  async enrich(
    jobs: any[],
    company: Company,
  ): Promise<CreateJobDto[]> {

    return jobs.map((job) => {

      const workMode:
        | 'remote'
        | 'onsite'
        | 'hybrid' =
        (
          job.location?.name ??
          ''
        )
          .toLowerCase()
          .includes('remote')
          ? 'remote'
          : 'onsite';

      return {
        company: company.name,

        title:
          job.title ??
          job.text,

        location:
          job.location?.name ??
          job.categories?.location ??
          'Remote',

        remote:
          workMode === 'remote',

        workMode,

        employmentType:
          job.categories?.commitment ??
          'full-time',

        url:
          job.absolute_url ??
          job.hostedUrl ??
          job.applyUrl,

        source:
          company.atsType ??
          'career-page',

        externalId:
          String(job.id),

        description:
          job.content ??
          job.descriptionPlain ??
          '',

        descriptionHtml:
          job.content ??
          job.descriptionHtml ??
          '',

        postedAt:
          job.updated_at
            ? new Date(job.updated_at)
            : new Date(),

        tags: [],
      };
    });
  }
}