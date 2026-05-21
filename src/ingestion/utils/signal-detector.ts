import { SignalType } from '../types/signals.types';

export interface DetectedSignal {
  type: SignalType;
  companyName: string;
}

/**
 * Detects whether a title contains a meaningful signal
 */
export function detectSignal(title: string): DetectedSignal | null {
  const lower = title.toLowerCase();

  // 🔥 NOISE FILTER (early exit)
  if (
    includesAny(lower, [
      'opinion',
      'analysis',
      'roundup',
      'top ',
      'list',
      'why ',
      'how ',
      'what ',
    ])
  ) {
    return null;
  }

  // FUNDING SIGNALS
  if (
    includesAny(lower, [
      'raises',
      'raised',
      'funding',
      'series a',
      'series b',
      'series c',
      'seed',
      'secures',
      'closes round',
      'investment',
      'backed by',
    ])
  ) {
    return {
      type: 'funding',
      companyName: extractCompany(title),
    };
  }

  // HIRING / GROWTH SIGNALS
  if (
    includesAny(lower, [
      'hiring',
      'jobs',
      'expands team',
      'recruiting',
      'growing team',
      'expands',
      'growth',
      'scales',
    ])
  ) {
    return {
      type: 'hiring',
      companyName: extractCompany(title),
    };
  }

  // PRODUCT / NEWS SIGNALS
  if (
    includesAny(lower, [
      'launches',
      'launched',
      'introduces',
      'announces',
      'unveils',
      'partners',
      'partnership',
      'acquires',
      'acquisition',
      'enters',
      'expands into',
    ])
  ) {
    return {
      type: 'news',
      companyName: extractCompany(title),
    };
  }

  return null;
}

/**
 * Helper: check if any keyword exists in string
 */
function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

/**
 * Improved company extraction
 */
export function extractCompany(title: string): string {
  const stopWords = [
    'raises',
    'raised',
    'launches',
    'launched',
    'announces',
    'introduces',
    'hiring',
    'secures',
    'closes',
    'expands',
    'partners',
    'acquires',
    'enters',
  ];

  const words = title.split(' ');

  const index = words.findIndex((word) =>
    stopWords.includes(word.toLowerCase()),
  );

  // take words BEFORE action keyword
  if (index > 0) {
    return cleanCompanyName(words.slice(0, index).join(' '));
  }

  // fallback: take first 2 words
  return cleanCompanyName(words.slice(0, 2).join(' '));
}

/**
 * Cleanup company name
 */
function cleanCompanyName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/\b(inc|ltd|llc|corp)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}
