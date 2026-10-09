import assert from 'assert';
import path from 'path';
import { verifySeoBuild } from '../scripts/seo-build-verifier.ts';

const publicDirectory = path.resolve(import.meta.dirname, '../public');
const failures = verifySeoBuild(publicDirectory);

assert.deepStrictEqual(
  failures,
  [],
  `Generated SEO output has regressions:\n${failures.map((failure) => `- ${failure}`).join('\n')}`,
);

console.log('PASS generated SEO output');
