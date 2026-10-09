import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { collectBuildContract, compareBuildContracts } from '../scripts/build-contract.mts';

const publicDirectory = path.resolve(import.meta.dirname, '../public');
const baselinePath = path.resolve(import.meta.dirname, 'fixtures/build-contract.json');
const expected = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
const actual = collectBuildContract(publicDirectory);
const failures = compareBuildContracts(expected, actual);

assert.deepStrictEqual(
  failures,
  [],
  `Generated build contract has regressions:\n${failures
    .map((failure) => `- ${failure}`)
    .join('\n')}`,
);

console.log(`PASS generated build contract (${actual.pageCount} routes)`);
