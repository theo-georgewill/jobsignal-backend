import { Injectable } from '@nestjs/common';
import { Company } from '@prisma/client';

@Injectable()
export class JobDiscoveryService {

  async discover(
    company: Company,
  ) {

    switch (
      company.atsType?.toLowerCase()
    ) {

      case 'greenhouse':
        return this.fetchGreenhouseJobs(
          company,
        );

      case 'lever':
        return this.fetchLeverJobs(
          company,
        );

      case 'ashby':
        return this.fetchAshbyJobs(
          company,
        );

      default:
        throw new Error(
          `Unsupported ATS: ${company.atsType}`,
        );
    }
  }

  private async fetchGreenhouseJobs(
    company: Company,
  ) {

    const token =
      company.careersUrl
        ?.split('/')
        .pop();

    if (!token) {
      throw new Error(
        'Invalid Greenhouse URL',
      );
    }

    const response =
      await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${token}/jobs`,
      );

    if (!response.ok) {
      throw new Error(
        'Failed to fetch Greenhouse jobs',
      );
    }

    const data =
      await response.json();

    return data.jobs;
  }

  private async fetchLeverJobs(
    company: Company,
  ) {

    const token =
      company.careersUrl
        ?.split('/')
        .pop();

    if (!token) {
      throw new Error(
        'Invalid Lever URL',
      );
    }

    const response =
      await fetch(
        `https://api.lever.co/v0/postings/${token}?mode=json`,
      );

    if (!response.ok) {
      throw new Error(
        'Failed to fetch Lever jobs',
      );
    }

    return response.json();
  }

  private async fetchAshbyJobs(
    company: Company,
  ) {

    const response =
      await fetch(
        `${company.careersUrl}`,
      );

    if (!response.ok) {
      throw new Error(
        'Failed to fetch Ashby jobs',
      );
    }

    return response.json();
  }
}