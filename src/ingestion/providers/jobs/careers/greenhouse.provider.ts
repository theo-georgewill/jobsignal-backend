type GreenhouseCompany = {
  name: string;
  boardToken: string;
};

export async function fetchGreenhouseJobs() {
  const companies: GreenhouseCompany[] = [
    { name: 'Stripe', boardToken: 'stripe' },
    { name: 'Notion', boardToken: 'notion' },
  ];

  const allJobs: any[] = [];

  for (const company of companies) {
    try {
      const res = await fetch(
        `https://boards-api.greenhouse.io/v1/boards/${company.boardToken}/jobs`
      );

      if (!res.ok) continue;

      const data = await res.json();

      const jobs = data.jobs.map((job: any) => ({
        title: job.title,
        company: company.name,
        location: job.location?.name || 'Unknown',
        remote: job.location?.name?.toLowerCase().includes('remote') ?? false,
        url: job.absolute_url,

        externalId: String(job.id),
        source: 'greenhouse',
        sourceType: 'careers',

        description: job.content || '',
        tags: [],
      }));

      allJobs.push(...jobs);
    } catch (err) {
      console.error(`Greenhouse error for ${company.name}`, err);
    }
  }

  return {
    jobs: allJobs,
  };
}