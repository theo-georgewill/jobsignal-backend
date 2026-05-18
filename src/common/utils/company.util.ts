export function normalizeCompanyName(
  name?: string | null,
): string {
  if (!name) return '';

  return (
    name
      // Decode common HTML entities
      .replace(/&amp;/gi, '&')

      // Remove commas at end
      .replace(/,+$/, '')

      // Remove extra whitespace
      .replace(/\s+/g, ' ')

      // Trim
      .trim()

      // Convert to lowercase first
      .toLowerCase()

      // Capitalize words
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase(),
      )
  );
}

export function extractDomain(
  url?: string | null,
): string | null {
  if (!url) return null;

  try {
    return new URL(
      url.startsWith('http')
        ? url
        : `https://${url}`,
    ).hostname.replace(
      /^www\./,
      '',
    );
  } catch {
    return url
      .replace(
        /^https?:\/\//,
        '',
      )
      .replace(/^www\./, '')
      .split('/')[0];
  }
}

export function getLogoUrl(
  website?: string | null,
): string | null {
  const domain =
    extractDomain(website);

  if (!domain) return null;

  return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
}

export function detectTags(
  text: string,
): string[] {
  const value =
    text.toLowerCase();

  const tags = new Set<string>();

  if (
    value.includes('ai') ||
    value.includes(
      'artificial intelligence',
    )
  ) {
    tags.add('ai');
  }

  if (
    value.includes('react')
  ) {
    tags.add('react');
  }

  if (
    value.includes(
      'typescript',
    )
  ) {
    tags.add('typescript');
  }

  if (
    value.includes(
      'remote',
    )
  ) {
    tags.add('remote');
  }

  if (
    value.includes(
      'opensource',
    )
  ) {
    tags.add('opensource');
  }

  return [...tags];
}