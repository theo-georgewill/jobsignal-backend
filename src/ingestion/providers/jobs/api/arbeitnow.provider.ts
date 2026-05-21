export async function fetchArbeitnowJobs() {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
  const data = await res.json();

  const jobs = data.data.map((job: any) => ({
    title: job.title,
    company: job.company_name,
    location: job.location,
    remote: job.remote,
    url: job.url,
    source: 'arbeitnow',
    description: job.description,
    tags: job.tags || [],
  }));

  return {
    jobs, // ✅ THIS is the fix
  };
}
