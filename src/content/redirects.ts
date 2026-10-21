import type { ArticleNode } from '../types/content.ts';
import { articleAliases } from './routing.ts';
import { legacyRedirects } from './legacy-redirects.ts';
import { legacyTagRedirects, type TagPage } from '../utils/tag-redirects.ts';
export function redirectRules(
  articles: ArticleNode[],
  tags: TagPage[],
  staticRules: string,
) {
  const rules = [staticRules.trimEnd()];
  const add = (from: string, to: string, condition = '') =>
    rules.push(`${from}  ${to}  301${condition ? `  ${condition}` : ''}`);
  for (const article of articles)
    for (const alias of articleAliases(article))
      add(alias.fromPath, alias.toPath);
  for (const rule of legacyTagRedirects(tags, ['en', 'pl'], 'en'))
    add(rule.fromPath, rule.toPath);
  const localized = (from: string, destination = from) => {
    for (const lang of ['en', 'pl'])
      add(from, `/${lang}${destination}`, `Language=${lang}`);
    add(from, `/en${destination}`);
  };
  for (const route of [
    '/articles/',
    '/contact/',
    '/',
    '/newsletter-pl/',
    '/search/',
    '/talks/',
  ])
    localized(route);
  for (const rule of legacyRedirects) add(rule.from, rule.to);
  localized('/guides/');
  localized('/category/', '/guides/');
  return rules.join('\n') + '\n';
}
