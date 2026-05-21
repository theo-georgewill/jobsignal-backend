export async function fetchRemotiveJobs() {
  const res = await fetch('https://remotive.com/api/remote-jobs');
  const data = await res.json();

  const jobs = data.jobs.map((job: any) => ({
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location,
    remote: true,
    url: job.url,
    source: 'remotive',
    description: job.description,
    tags: job.tags || [],
  }));

  return {
    jobs, // ✅ FIX
  };
}
