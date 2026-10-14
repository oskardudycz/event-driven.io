import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'vitest';
import { readFrontmatter } from '../tests/helpers/frontmatter.ts';

const root = join(import.meta.dirname, '..');
const guidesRoot = join(root, 'content/paths');

function guideLines(language: string) {
  return readdirSync(guidesRoot)
    .sort()
    .map((directory) => {
      const markdown = readFileSync(
        join(guidesRoot, directory, `index.${language}.md`),
        'utf8',
      );
      const { title, description } = readFrontmatter(
        /^---\n([\s\S]*?)\n---/.exec(markdown)?.[1],
      );
      const slug = directory.split('--')[1];
      return `- [${title}](https://event-driven.io/${language}/guides/${slug}/): ${description}`;
    });
}

function section(output: string, heading: string) {
  const start = output.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, `Missing section ${heading}`);
  const end = output.indexOf('\n## ', start + 1);
  return output
    .slice(start, end)
    .split('\n')
    .filter((line) => line.startsWith('- '));
}

test('llms.txt lists every guide with its URL and description, per language, in guide order', () => {
  const result = spawnSync(
    process.execPath,
    [join(root, 'scripts/generate-llms-txt.ts')],
    { cwd: root, encoding: 'utf8' },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, '');
  const output = readFileSync(join(root, 'static/llms.txt'), 'utf8');
  assert.deepEqual(section(output, 'English guides'), guideLines('en'));
  assert.deepEqual(section(output, 'Polish guides'), guideLines('pl'));
});
