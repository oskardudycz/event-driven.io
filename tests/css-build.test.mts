import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import cheerio from 'cheerio';
import { createCssModuleIdent } from '../scripts/css-module-ident.mts';

test('CSS exports invalidate shared HTML for declaration edits and restore deterministically', () => {
  const root = mkdtempSync(join(tmpdir(), 'css-ident-'));
  try {
    const source = join(root, 'src');
    mkdirSync(source);
    const module = join(source, 'Layout.module.css');
    const shared = join(source, 'tokens.css');
    writeFileSync(module, '.layout { padding: 20px; }');
    writeFileSync(shared, ':root { --color: black; }');
    const dependencies = new Set<string>();
    const identify = createCssModuleIdent(root);
    const context = {
      resourcePath: module,
      addDependency: (file: string) => dependencies.add(file),
      addContextDependency: (directory: string) => dependencies.add(directory),
    };
    const baseline = identify(context, '', 'layout');
    assert.equal(identify(context, '', 'layout'), baseline);
    writeFileSync(shared, ':root { --color: white; }');
    assert.notEqual(identify(context, '', 'layout'), baseline);
    writeFileSync(shared, ':root { --color: black; }');
    assert.equal(identify(context, '', 'layout'), baseline);
    writeFileSync(join(source, 'Other.module.css'), '.card { color: red; }');
    assert.notEqual(identify(context, '', 'layout'), baseline);
    rmSync(join(source, 'Other.module.css'));
    assert.equal(identify(context, '', 'layout'), baseline);
    assert.ok(dependencies.has(module));
    assert.ok(dependencies.has(shared));
    assert.ok(dependencies.has(source));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// Old CSS assets may legitimately remain on disk after a warm build. Compare
// with the current compilation, not just with whichever file the HTML names.
test('every generated page embeds CSS from the current webpack compilation', () => {
  const stats = JSON.parse(readFileSync('public/webpack.stats.json', 'utf8'));
  const currentAssets = new Set<string>(Object.values<string[]>(stats.assetsByChunkName).flat());
  const css = new Map<string, string>();
  let checked = 0;
  for (const entry of readdirSync('public', { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.html')) continue;
    const file = join(entry.parentPath, entry.name);
    const $ = cheerio.load(readFileSync(file, 'utf8'));
    if ($('#___gatsby').length) {
      assert.ok($('style[data-href]').length > 0, `${file} has no server-rendered stylesheet`);
    }
    $('style[data-href]').each((_, element) => {
      const asset = $(element).attr('data-href')!.replace(/^\//, '');
      assert.ok(currentAssets.has(asset), `${file} references obsolete CSS: ${asset}`);
      if (!css.has(asset)) css.set(asset, readFileSync(join('public', asset), 'utf8'));
      assert.ok($(element).text() === css.get(asset), `${file} embeds stale CSS: ${asset}`);
      checked++;
    });
    assert.equal($('style[id^="__jsx-"]').length, 0, `${file} still uses styled-jsx`);
  }
  assert.ok(checked > 0, 'Expected generated pages with server-rendered CSS');
});
