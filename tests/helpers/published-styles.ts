import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'cheerio';
export function publishedStyles(file: string, directory = 'public') {
  const $ = load(readFileSync(file, 'utf8'));
  return [
    ...$('style')
      .toArray()
      .map((element) => $(element).text()),
    ...$('link[rel=stylesheet][href]')
      .toArray()
      .map((element) =>
        readFileSync(join(directory, $(element).attr('href')!), 'utf8'),
      ),
  ].join('\n');
}
