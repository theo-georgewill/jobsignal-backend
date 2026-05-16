import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const sources = [
    {
      name: 'arbeitnow',
      type: 'api',
    },
    {
      name: 'remotive',
      type: 'api',
    },
    {
      name: 'remoteok',
      type: 'api',
    },
    {
      name: 'weworkremotely',
      type: 'scraper',
    },
  ];

  for (const source of sources) {
    await prisma.ingestionSource.upsert({
      where: {
        name: source.name,
      },
      update: {},
      create: {
        name: source.name,
        type: source.type,
        enabled: true,
        healthy: true,
        successRate: 100,
      },
    });
  }

  console.log(
    'Ingestion sources seeded'
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });