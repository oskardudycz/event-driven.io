import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const audits = [
  'scripts/audit-console.mts',
  'scripts/audit-indexing.mts',
  'scripts/audit-performance.mts',
  'scripts/profile-fonts.mts',
];

for (const script of audits) {
  test(`${script} documents its CLI and rejects malformed options before starting an audit`, () => {
    const help = spawnSync(process.execPath, [script, '--help'], { encoding: 'utf8' });
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /Usage:/);
    for (const args of [['--unknown'], ['--output'], ['--output', '--help']]) {
      const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
      assert.notEqual(result.status, 0, `${script}: accepted ${args.join(' ')}`);
      assert.match(result.stderr, /ERR_PARSE_ARGS_/);
    }
  });
}

for (const [script, option, value] of [
  ['scripts/audit-console.mts', '--seconds', '61'],
  ['scripts/audit-performance.mts', '--runs', '0'],
  ['scripts/profile-fonts.mts', '--runs', '1.5'],
]) {
  test(`${script} bounds ${option} before launching a browser`, () => {
    const result = spawnSync(process.execPath, [script, option, value], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /must be between/);
  });
}
