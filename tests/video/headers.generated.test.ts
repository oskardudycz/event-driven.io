import { readFileSync } from 'node:fs';
import { expect, test } from 'vitest';
test('published hosting headers send the referrer YouTube requires and retain security/discovery headers', () => {
  const headers = readFileSync('dist/_headers', 'utf8');
  expect(headers).toMatch(
    /\/\*\n(?: {2}[^\n]+\n)* {2}Referrer-Policy: strict-origin-when-cross-origin\n/,
  );
  expect(headers).not.toContain('Referrer-Policy: same-origin');
  expect(headers.match(/Referrer-Policy:/g)).toHaveLength(1);
  expect(headers).toContain('X-Frame-Options: DENY');
  expect(headers).toContain('X-Content-Type-Options: nosniff');
  expect(headers).toContain('Content-Type: text/plain; charset=UTF-8');
});
