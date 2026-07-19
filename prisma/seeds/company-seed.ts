// prisma/company-seed.ts

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  normalizeCompanyName,
} from '../../src/common/utils/company.util';

const adapter = new PrismaPg({
  connectionString:
    process.env.DATABASE_URL!,
});

const prisma =
  new PrismaClient({
    adapter,
  });

async function main() {
  const companies = [
    {
      name: 'GitLab',
      website:
        'https://gitlab.com',
      careersUrl:
        'https://about.gitlab.com/jobs/',
      atsType: 'custom',
      tags: [
        'remote',
        'opensource',
        'devops',
      ],
    },

    {
      name: 'Automattic',
      website:
        'https://automattic.com',
      careersUrl:
        'https://automattic.com/work-with-us/',
      atsType: 'custom',
      tags: [
        'remote',
        'opensource',
        'wordpress',
      ],
    },

    {
      name: 'Vercel',
      website:
        'https://vercel.com',
      careersUrl:
        'https://jobs.lever.co/vercel',
      atsType: 'lever',
      tags: [
        'frontend',
        'developer-tools',
        'startup',
      ],
    },

    {
      name: 'Supabase',
      website:
        'https://supabase.com',
      careersUrl:
        'https://jobs.ashbyhq.com/supabase',
      atsType: 'ashby',
      tags: [
        'opensource',
        'database',
        'startup',
      ],
    },

    {
      name: 'Cloudflare',
      website:
        'https://cloudflare.com',
      careersUrl:
        'https://www.cloudflare.com/careers/jobs/',
      atsType: 'custom',
      tags: [
        'security',
        'infrastructure',
        'enterprise',
      ],
    },

    {
      name: 'OpenAI',
      website:
        'https://openai.com',
      careersUrl:
        'https://openai.com/careers',
      atsType: 'custom',
      tags: [
        'ai',
        'research',
        'top-tier',
      ],
    },

    {
      name: 'Anthropic',
      website:
        'https://anthropic.com',
      careersUrl:
        'https://www.anthropic.com/careers',
      atsType: 'custom',
      tags: [
        'ai',
        'research',
        'startup',
      ],
    },

    {
      name: 'Hugging Face',
      website:
        'https://huggingface.co',
      careersUrl:
        'https://huggingface.co/jobs',
      atsType: 'custom',
      tags: [
        'ai',
        'opensource',
        'ml',
      ],
    },

    {
      name: 'Docker',
      website:
        'https://docker.com',
      careersUrl:
        'https://www.docker.com/careers/',
      atsType: 'custom',
      tags: [
        'opensource',
        'devops',
        'containers',
      ],
    },

    {
      name: 'HashiCorp',
      website:
        'https://hashicorp.com',
      careersUrl:
        'https://www.hashicorp.com/careers',
      atsType: 'custom',
      tags: [
        'devops',
        'infrastructure',
        'enterprise',
      ],
    },

    {
      name: 'Netlify',
      website:
        'https://netlify.com',
      careersUrl:
        'https://www.netlify.com/careers/',
      atsType: 'custom',
      tags: [
        'frontend',
        'developer-tools',
        'startup',
      ],
    },

    {
      name: 'Stripe',
      website:
        'https://stripe.com',
      careersUrl:
        'https://stripe.com/jobs',
      atsType: 'custom',
      tags: [
        'fintech',
        'payments',
        'top-tier',
      ],
    },

    {
      name: 'Shopify',
      website:
        'https://shopify.com',
      careersUrl:
        'https://www.shopify.com/careers',
      atsType: 'custom',
      tags: [
        'ecommerce',
        'remote',
        'enterprise',
      ],
    },

    {
      name: 'Sentry',
      website:
        'https://sentry.io',
      careersUrl:
        'https://sentry.io/careers/',
      atsType: 'custom',
      tags: [
        'developer-tools',
        'opensource',
        'monitoring',
      ],
    },

    {
      name: 'PostHog',
      website:
        'https://posthog.com',
      careersUrl:
        'https://posthog.com/careers',
      atsType: 'custom',
      tags: [
        'opensource',
        'analytics',
        'startup',
      ],
    },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: {
        canonicalName:
          normalizeCompanyName(company.name),
      },
      update: {
        name: company.name,
        canonicalName:
          normalizeCompanyName(
            company.name,
          ),
        website:
          company.website,
        careersUrl:
          company.careersUrl,
        atsType:
          company.atsType,
        tags: company.tags,
        verified: true,
        resolutionStatus:
          'resolved',
        enabled: true,
        healthy: true,
        priority: 1,
      },
      create: {
        name: company.name,
        canonicalName:
          normalizeCompanyName(
            company.name,
          ),
        website:
          company.website,
        careersUrl:
          company.careersUrl,
        atsType:
          company.atsType,
        tags: company.tags,
        verified: true,
        resolutionStatus:
          'resolved',
        enabled: true,
        healthy: true,
        priority: 1,
      },
    });
  }

  console.log(
    'Seeded companies'
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });