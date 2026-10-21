import { publishedStyles } from '../helpers/published-styles.ts';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as cheerio from 'cheerio';
import postcss from 'postcss';

test('production CSS contains working layout utilities and no uncompiled directives', () => {
  const root = postcss.parse(publishedStyles('dist/en/talks/index.html'));
  root.walkAtRules((rule) => {
    assert.ok(
      !['tailwind', 'source', 'theme', 'apply'].includes(rule.name),
      `Uncompiled @${rule.name} in production CSS`,
    );
  });
  let grid = false;
  root.walkRules('.grid', (rule) => {
    rule.walkDecls('display', (declaration) => {
      if (declaration.value === 'grid') grid = true;
    });
  });
  assert.ok(grid, 'Production CSS must provide the grid used by video cards');
});

// Old CSS assets may legitimately remain on disk after a warm build. Compare
// with the current compilation, not just with whichever file the HTML names.
test('every generated page publishes its referenced stylesheets and retains current inline CSS', () => {
  const stats = existsSync('dist/webpack.stats.json')
    ? (JSON.parse(readFileSync('dist/webpack.stats.json', 'utf8')) as {
        assetsByChunkName: Record<string, string[]>;
      })
    : { assetsByChunkName: {} };
  const currentAssets = new Set<string>(
    Object.values<string[]>(stats.assetsByChunkName).flat(),
  );
  const css = new Map<string, string>();
  let checked = 0;
  for (const entry of readdirSync('dist', {
    recursive: true,
    withFileTypes: true,
  })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const file = join(entry.parentPath, entry.name);
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    if ($('#___gatsby').length) {
      assert.ok(
        $('style[data-href]').length > 0,
        `${file} has no server-rendered stylesheet`,
      );
    }
    $('link[rel=stylesheet][href]').each((_, element) => {
      const asset = $(element).attr('href')!;
      assert.ok(
        readFileSync(join('dist', asset), 'utf8').length > 0,
        `${file}: missing/empty stylesheet ${asset}`,
      );
      checked++;
    });
    $('style[data-href]').each((_, element) => {
      const asset = $(element).attr('data-href')!.replace(/^\//, '');
      assert.ok(
        currentAssets.has(asset),
        `${file} references obsolete CSS: ${asset}`,
      );
      if (!css.has(asset))
        css.set(asset, readFileSync(join('dist', asset), 'utf8'));
      assert.ok(
        $(element).text() === css.get(asset),
        `${file} embeds stale CSS: ${asset}`,
      );
      checked++;
    });
  }
  assert.ok(checked > 0, 'Expected generated pages with server-rendered CSS');
});
