import * as cheerio from 'cheerio';

export function extractArticles(
  html: string,
  config: {
    articleSelector: string;
    titleSelector: string;
    linkSelector: string;
  }
) {
  const $ = cheerio.load(html);
  const results: { title: string; link: string }[] = [];

  $(config.articleSelector).each((_, el) => {
    const title = $(el).find(config.titleSelector).text().trim();
    const link = $(el).find(config.linkSelector).attr('href');

    if (!title || !link) return;

    results.push({ title, link });
  });

  return results;
}