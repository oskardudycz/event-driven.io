import assert from 'node:assert/strict';
import { test } from 'vitest';

test('publication metadata preserves legacy dates and accepts only real timezone timestamps', async () => {
  const { publicationDate } = await import('./publication-date.ts');
  assert.equal(publicationDate(undefined, '2022-03-16'), '2022-03-16');
  assert.equal(publicationDate(null, '2022-03-16'), '2022-03-16');
  for (const date of [
    '2026-10-05T12:34:56Z',
    '2026-10-05T12:34:56.123+02:00',
  ]) {
    assert.equal(publicationDate(date, '2022-03-16'), date);
  }
  for (const date of [
    '',
    '2026-10-05',
    '2026-10-05T12:34:56',
    '2026-02-30T12:34:56Z',
    '2026-10-05T25:00:00Z',
    'bad',
  ]) {
    assert.throws(() => publicationDate(date, '2022-03-16'), /publishedAt/);
  }
});
