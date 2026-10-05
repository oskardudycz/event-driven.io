import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const codeRoot = path.resolve(import.meta.dirname, '../..');
const article = readFileSync(path.join(codeRoot, '../index.en.md'), 'utf8');
const demos = article.split('## Real-world example')[0] ?? '';

const readSources = (directory: string): string[] =>
  readdirSync(path.join(codeRoot, directory), {
    recursive: true,
    encoding: 'utf8',
  })
    .filter((file) => file.endsWith('.ts'))
    .map((file) => readFileSync(path.join(codeRoot, directory, file), 'utf8'));

const code = ['src', 'test', 'e2e'].flatMap(readSources).join('\n');
const tests = readSources('test').join('\n');

const snippets = [...demos.matchAll(/```(sql|ini)\n([\s\S]*?)```/g)].map(
  ([, language = '', body = '']) => ({ language, body }),
);

const statementsIn = (sql: string) =>
  sql
    .split(/(?<=;)\n/)
    .map((statement) => statement.trim())
    .filter(Boolean);

const linesIn = (ini: string) =>
  ini
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const pgBouncerConfigs = ['session', 'transaction', 'timeouts'].flatMap(
  (mode) =>
    readFileSync(
      path.join(codeRoot, 'pgbouncer', mode, 'pgbouncer.ini'),
      'utf8',
    ).split('\n'),
);

describe('Article snippets', () => {
  it('are found in the article', () => {
    expect(snippets.length).toBeGreaterThan(0);
  });

  it.each(
    snippets
      .filter(({ language }) => language === 'sql')
      .flatMap(({ body }) => statementsIn(body)),
  )('"%s" is run by the code', (statement) => {
    expect(code).toContain(statement);
  });

  it.each(
    snippets
      .filter(({ language }) => language === 'ini')
      .flatMap(({ body }) => linesIn(body)),
  )('"%s" is in the real PgBouncer config', (line) => {
    expect(pgBouncerConfigs).toContain(line);
  });

  it.each([
    'S1',
    'S2',
    'S3',
    'S4',
    'S5',
    'M1',
    'P3',
    'P4',
    'T0',
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'R1',
    'X1',
    'X2',
  ])('%s has a test named after it', (id) => {
    expect(tests).toMatch(new RegExp(`(it|describe)\\(\\s*'${id}:`));
  });
});
