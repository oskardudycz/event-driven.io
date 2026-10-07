import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, existsSync } from 'node:fs';
import cheerio from 'cheerio';
import { parseAllRedirects } from 'netlify-redirect-parser';

for (const [file, lang] of [
  ['public/404.html', 'en'],
  ['public/en/404/index.html', 'en'],
  ['public/pl/404/index.html', 'pl'],
]) {
  test(`${file} provides localized, index-excluded recovery links without JavaScript`, () => {
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    assert.equal($('html').attr('lang'), lang);
    assert.equal($('h1').length, 1);
    assert.match($('h1').text(), lang === 'pl' ? /Ups!/ : /Oops!/);
    assert.match($('meta[name="robots"]').attr('content')!, /noindex/);
    const links = $('article nav a')
      .map((_, element) => $(element).attr('href'))
      .get();
    assert.deepEqual(links, [`/${lang}/`, `/${lang}/articles/`, `/${lang}/search/`]);
    for (const link of links) assert.ok(existsSync(`public${link}index.html`), link);
  });
}

test('fallback rewrites preserve HTTP 404 and follow all specific redirects', async () => {
  const lines = readFileSync('public/_redirects', 'utf8')
    .split('\n')
    .map((line) => line.trim().replace(/\s+/g, ' '))
    .filter((line) => line && !line.startsWith('#'));
  const { redirects, errors } = await parseAllRedirects({
    redirectsFiles: ['public/_redirects'],
    netlifyConfigPath: 'netlify.toml',
    minimal: true,
  });
  assert.deepEqual(errors, []);
  assert.deepEqual(
    redirects.slice(-3).map(({ from, to, status }) => `${from} ${to} ${status}`),
    ['/en/* /en/404/ 404', '/pl/* /pl/404/ 404', '/* /404.html 404'],
  );
  assert.ok(
    !lines.some((line) => /^\/404(?:\/|\.html) /.test(line)),
    'Root error pages must not redirect to themselves or another error route',
  );
  const matches = JSON.parse(readFileSync('.cache/match-paths.json', 'utf8'));
  for (const lang of ['en', 'pl'])
    assert.ok(
      matches.some(
        (page: { path: string; matchPath: string }) =>
          page.path === `/${lang}/404/` && page.matchPath === `/${lang}/*`,
      ),
    );
});
