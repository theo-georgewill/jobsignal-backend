export async function fetchRemoteOKJobs() {
  const res = await fetch('https://remoteok.com/api', {
    headers: {
      'User-Agent': 'Mozilla/5.0',
    },
  });

  const data = await res.json();

  const jobs = data
    .filter((job: any) => job.position)
    .map((job: any) => ({
      title: job.position,
      company: job.company,
      location: job.location || 'Remote',
      remote: true,
      url: job.url,
      source: 'remoteok',
      description: job.description || '',
      tags: job.tags || [],
    }));

  return {
    jobs, // ✅ FIX
  };
}
