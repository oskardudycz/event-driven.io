import { isDeepStrictEqual, parseArgs } from 'node:util';
import { resolve } from 'node:path';
import {
  buildContractAdditions,
  collectBuildContract,
  collectRedirectRules,
  compareBuildContracts,
} from './build-contract.ts';
import { collectHeadContract, compareHeadContracts } from './head-contract.ts';

const { values } = parseArgs({
  options: { baseline: { type: 'string' }, candidate: { type: 'string' } },
});
if (!values.baseline || !values.candidate) {
  throw new Error(
    'Usage: npm run compare:builds -- --baseline <output directory> --candidate <output directory>',
  );
}
const baseline = resolve(values.baseline);
const candidate = resolve(values.candidate);
const before = collectBuildContract(baseline);
const after = collectBuildContract(candidate);
const failures = [
  ...compareBuildContracts(before, after),
  ...buildContractAdditions(before, after),
  ...compareHeadContracts(
    collectHeadContract(baseline),
    collectHeadContract(candidate),
  ),
];
if (
  !isDeepStrictEqual(
    collectRedirectRules(baseline),
    collectRedirectRules(candidate),
  )
) {
  failures.push('Ordered redirect rules changed');
}
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `Build parity passed: ${before.pageCount} pages, redirects, sitemap URLs, feed identities and every page head.`,
  );
}
