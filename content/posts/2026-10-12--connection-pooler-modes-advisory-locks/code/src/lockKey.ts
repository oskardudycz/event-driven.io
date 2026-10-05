import { createHash } from 'node:crypto';

// Same as PostgreSQL's ('x' || substr(md5(name), 1, 16))::bit(64)::bigint
export const lockKey = (name: string): bigint => {
  const first16HexChars = createHash('md5')
    .update(name)
    .digest('hex')
    .slice(0, 16);
  return BigInt.asIntN(64, BigInt(`0x${first16HexChars}`));
};
