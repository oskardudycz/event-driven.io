import assert from 'node:assert/strict';
import yaml from 'js-yaml';
import type { Frontmatter } from '../../src/types/content.ts';

export function readFrontmatter(source: string | undefined): Frontmatter {
  assert.equal(typeof source, 'string', 'Missing frontmatter block');
  const value = yaml.load(source as string);
  assert.ok(value && typeof value === 'object' && 'title' in value);
  assert.equal(typeof value.title, 'string');
  return value as Frontmatter;
}
