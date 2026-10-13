import assert from 'node:assert/strict';
import { test } from 'vitest';

test('menu overflow keeps exact fits and reserves space for its expand control', async () => {
  const { getOverflowedIndexes } = await import('./overflow.ts');
  assert.deepEqual(getOverflowedIndexes([40, 40, 30], 80), [2]);
  assert.deepEqual(getOverflowedIndexes([40, 40, 30], 110), []);
  assert.deepEqual(getOverflowedIndexes([40, 40, 30], 110 - 60), [1, 2]);
  assert.deepEqual(getOverflowedIndexes([40, 40, 30], 0), [0, 1, 2]);
  assert.deepEqual(getOverflowedIndexes([], 80), []);
});
