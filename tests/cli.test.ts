import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const audits = [
  'scripts/audit-console.ts',
  'scripts/audit-indexing.ts',
  'scripts/audit-performance.ts',
  'scripts/profile-fonts.ts',
];

for (const script of audits) {
  void test(`${script} documents its CLI and rejects malformed options before starting an audit`, () => {
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
  ['scripts/audit-console.ts', '--seconds', '61'],
  ['scripts/audit-performance.ts', '--runs', '0'],
  ['scripts/profile-fonts.ts', '--runs', '1.5'],
]) {
  void test(`${script} bounds ${option} before launching a browser`, () => {
    const result = spawnSync(process.execPath, [script, option, value], { encoding: 'utf8' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /must be between/);
  });
}
