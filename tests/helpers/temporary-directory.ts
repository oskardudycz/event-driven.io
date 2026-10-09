import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { TestContext } from 'node:test';

export function temporaryDirectory(context: Pick<TestContext, 'after'>, prefix: string): string {
  const directory = mkdtempSync(join(tmpdir(), prefix));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
}
