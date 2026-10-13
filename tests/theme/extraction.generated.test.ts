import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import * as cheerio from 'cheerio';
import postcss from 'postcss';

test('production CSS contains working layout utilities and no uncompiled directives', () => {
  const $ = cheerio.load(readFileSync('public/en/talks/index.html', 'utf8'));
  const root = postcss.parse($('style[data-href]').text());
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
test('every generated page embeds CSS from the current webpack compilation', () => {
  const stats = JSON.parse(
    readFileSync('public/webpack.stats.json', 'utf8'),
  ) as {
    assetsByChunkName: Record<string, string[]>;
  };
  const currentAssets = new Set<string>(
    Object.values<string[]>(stats.assetsByChunkName).flat(),
  );
  const css = new Map<string, string>();
  let checked = 0;
  for (const entry of readdirSync('public', {
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
    $('style[data-href]').each((_, element) => {
      const asset = $(element).attr('data-href')!.replace(/^\//, '');
      assert.ok(
        currentAssets.has(asset),
        `${file} references obsolete CSS: ${asset}`,
      );
      if (!css.has(asset))
        css.set(asset, readFileSync(join('public', asset), 'utf8'));
      assert.ok(
        $(element).text() === css.get(asset),
        `${file} embeds stale CSS: ${asset}`,
      );
      checked++;
    });
  }
  assert.ok(checked > 0, 'Expected generated pages with server-rendered CSS');
});
