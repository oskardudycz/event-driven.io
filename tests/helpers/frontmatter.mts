import assert from 'node:assert/strict';
import yaml from 'js-yaml';
import type { Frontmatter } from '../../src/types/content.ts';

export function readFrontmatter(source: string): Frontmatter {
  const value = yaml.load(source);
  assert.ok(value && typeof value === 'object' && 'title' in value);
  assert.equal(typeof value.title, 'string');
  return value as Frontmatter;
}
