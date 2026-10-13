import assert from 'assert';
import path from 'path';
import { verifySeoBuild } from '../../scripts/seo-build-verifier.ts';

import { test } from 'vitest';

test('generated SEO output has valid headings, metadata, schema and headers', () => {
  const publicDirectory = path.resolve(import.meta.dirname, '../../public');
  const failures = verifySeoBuild(publicDirectory);

  assert.deepStrictEqual(
    failures,
    [],
    `Generated SEO output has regressions:\n${failures.map((failure) => `- ${failure}`).join('\n')}`,
  );
});
