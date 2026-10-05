import { describe, expect, it } from 'vitest';
import { lockKey } from '../../src/lockKey';

// Expected values were calculated once in PostgreSQL 18 with:
// SELECT ('x' || substr(md5(name), 1, 16))::bit(64)::bigint
describe('lockKey', () => {
  it.each([
    ['shopping_cart_summary', 4600154350139664099n],
    ['emt:processor:shopping_cart_summary', 1301841681950217102n],
    ['a', 919145239626757800n],
    ['', -3162216497309240828n],
  ])('hashes %j to the same key as PostgreSQL', (name, expected) => {
    expect(lockKey(name)).toBe(expected);
  });
});
