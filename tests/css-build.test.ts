import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import * as cheerio from 'cheerio';
import postcss from 'postcss';
import postcssConfig from '../postcss.config.mjs';

void test('the styling pipeline emits token utilities and preserves nested module selectors', async () => {
  const input =
    readFileSync('src/theme/tailwind.css', 'utf8') +
    `
    @source inline("text-accent gap-gutter min-h-[80vh]");
    .menu { :global(.homepage) & { color: var(--text-color-brand); } }
  `;
  const { root } = await postcss(postcssConfig().plugins).process(input, {
    from: join(process.cwd(), 'src/theme/tailwind.css'),
  });
  const declarations = new Map<string, Map<string, string>>();
  root.walkRules((rule) => {
    const values = new Map<string, string>();
    rule.walkDecls((declaration) => {
      values.set(declaration.prop, declaration.value);
    });
    declarations.set(rule.selector, values);
  });
  assert.equal(
    declarations.get('.text-accent')?.get('color'),
    'var(--text-color-brand)',
  );
  assert.equal(declarations.get('.gap-gutter')?.get('gap'), 'var(--space-md)');
  assert.equal(
    declarations.get('.min-h-\\[80vh\\]')?.get('min-height'),
    '80vh',
  );
  assert.equal(
    declarations.get(':global(.homepage) .menu')?.get('color'),
    'var(--text-color-brand)',
  );
  // Adding utilities must not introduce a different heading reset.
  for (const selector of declarations.keys()) {
    assert.ok(!selector.split(',').some((part) => part.trim() === 'h1'));
  }
});

// Old CSS assets may legitimately remain on disk after a warm build. Compare
// with the current compilation, not just with whichever file the HTML names.
void test('every generated page embeds CSS from the current webpack compilation', () => {
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
