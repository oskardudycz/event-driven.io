import { temporaryDirectory } from './helpers/temporary-directory.ts';
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  existsSync,
  readdirSync,
} from 'node:fs';
import { resolve, join } from 'node:path';
import sharp from 'sharp';
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
    const help = spawnSync(process.execPath, [script, '--help'], {
      encoding: 'utf8',
    });
    assert.equal(help.status, 0, help.stderr);
    assert.match(help.stdout, /Usage:/);
    for (const args of [['--unknown'], ['--output'], ['--output', '--help']]) {
      const result = spawnSync(process.execPath, [script, ...args], {
        encoding: 'utf8',
      });
      assert.notEqual(
        result.status,
        0,
        `${script}: accepted ${args.join(' ')}`,
      );
      assert.match(result.stderr, /ERR_PARSE_ARGS_/);
    }
  });
}

for (const [script, option, value] of [
  ['scripts/audit-console.ts', '--seconds', '61'],
  ['scripts/audit-performance.ts', '--runs', '0'],
  ['scripts/profile-fonts.ts', '--runs', '1.5'],
] as const) {
  void test(`${script} bounds ${option} before launching a browser`, () => {
    const result = spawnSync(process.execPath, [script, option, value], {
      encoding: 'utf8',
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /must be between/);
  });
}

void test('newsletter import copies a local repository and preserves published content when cloning fails', (t) => {
  const fixture = temporaryDirectory(t, 'newsletter-command-');
  const repository = join(fixture, 'source repository');
  const workspace = join(fixture, 'workspace');
  mkdirSync(join(repository, 'content/posts'), { recursive: true });
  mkdirSync(join(workspace, 'content/newsletter-pl'), { recursive: true });
  writeFileSync(join(repository, 'content/posts/issue.md'), '# Newsletter\n');
  writeFileSync(join(workspace, 'content/newsletter-pl/old.md'), 'Old issue');
  const git = (...args: string[]) => {
    const result = spawnSync('git', args, {
      cwd: repository,
      encoding: 'utf8',
    });
    assert.equal(result.status, 0, result.stderr);
  };
  git('init', '--quiet');
  git('add', '.');
  git(
    '-c',
    'user.name=Fixture',
    '-c',
    'user.email=fixture@example.com',
    'commit',
    '--quiet',
    '-m',
    'Fixture',
  );
  const run = (source: string) =>
    spawnSync(process.execPath, [resolve('import/import-newsletter.ts')], {
      cwd: workspace,
      env: { ...process.env, NEWSLETTER_REPO_URL: source },
      encoding: 'utf8',
    });
  const imported = run(repository);
  assert.equal(imported.status, 0, imported.stderr);
  const output = join(workspace, 'content/newsletter-pl');
  assert.equal(
    readFileSync(join(output, 'issue.md'), 'utf8'),
    '# Newsletter\n',
  );
  assert.ok(existsSync(join(output, '.gitkeep')));
  assert.ok(!existsSync(join(output, 'old.md')));
  const failed = run(join(fixture, 'missing-repository'));
  assert.notEqual(failed.status, 0);
  assert.equal(
    readFileSync(join(output, 'issue.md'), 'utf8'),
    '# Newsletter\n',
  );
});

void test('icon generation writes the requested PNG sizes without a remote CLI', async (t) => {
  const output = temporaryDirectory(t, 'generated-icons-');
  const result = spawnSync(
    process.execPath,
    ['scripts/generate-app-icons.ts', output],
    { encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  const icons = readdirSync(output);
  assert.equal(icons.length, 19);
  for (const file of icons) {
    const size = Number(file.match(/-(\d+)x\d+\.png$/)?.[1]);
    const metadata = await sharp(join(output, file)).metadata();
    assert.equal(metadata.format, 'png');
    assert.equal(metadata.width, size);
    assert.equal(metadata.height, size);
  }
});
