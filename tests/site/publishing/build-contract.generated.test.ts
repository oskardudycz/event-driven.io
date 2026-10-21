import type { BuildContract } from '../../../scripts/build-contract.ts';
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  buildContractAdditions,
  collectBuildContract,
  compareBuildContracts,
} from '../../../scripts/build-contract.ts';

import { test } from 'vitest';

test('published routes, redirects, sitemap URLs and feed identities preserve the contract', () => {
  const publicDirectory = path.resolve(import.meta.dirname, '../../../dist');
  const baselinePath = path.resolve(
    import.meta.dirname,
    '../../fixtures/build-contract.json',
  );
  const expected = JSON.parse(
    fs.readFileSync(baselinePath, 'utf8'),
  ) as BuildContract;
  const actual = collectBuildContract(publicDirectory);
  const failures = compareBuildContracts(expected, actual);

  assert.deepStrictEqual(
    failures,
    [],
    `Generated build contract has regressions:\n${failures
      .map((failure) => `- ${failure}`)
      .join('\n')}`,
  );

  buildContractAdditions(expected, actual).forEach((addition) =>
    console.log(`New since the build-contract baseline: ${addition}`),
  );
});
