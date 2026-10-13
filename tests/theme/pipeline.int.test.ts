import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import postcss from 'postcss';
import postcssConfig from '../../postcss.config.mjs';

test('the styling pipeline emits token utilities and preserves nested module selectors', async () => {
  const input =
    readFileSync('src/theme/tailwind.css', 'utf8') +
    readFileSync('src/theme/tokens.css', 'utf8') +
    `
    @source inline("text-accent gap-gutter min-h-[80vh] font-bold font-semibold");
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
  // Site tokens must preserve the standard weights of generated utilities.
  for (const [utility, weight] of [
    ['bold', '700'],
    ['semibold', '600'],
  ]) {
    let resolvedWeight: string | undefined;
    root.walkDecls(`--font-weight-${utility}`, (declaration) => {
      resolvedWeight = declaration.value;
    });
    assert.equal(resolvedWeight, weight);
    assert.equal(
      declarations.get(`.font-${utility}`)?.get('font-weight'),
      `var(--font-weight-${utility})`,
    );
  }
  // Adding utilities must not introduce a different heading reset.
  for (const selector of declarations.keys()) {
    assert.ok(!selector.split(',').some((part) => part.trim() === 'h1'));
  }
});
