import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import ts from 'typescript';
import config from '../astro.config.mjs';
assert.equal(config.trailingSlash, 'always');
assert.equal(config.site, 'https://event-driven.io');
const webfinger = JSON.parse(
  readFileSync('public/.well-known/webfinger', 'utf8'),
) as { subject: string };
assert.equal(webfinger.subject, 'acct:oskardudycz@hachyderm.io');
const files = globSync('src/**/*.{ts,tsx}').filter(
  (file) => !file.endsWith('.d.ts'),
);
for (const file of files) {
  const { diagnostics = [] } = ts.transpileModule(readFileSync(file, 'utf8'), {
    fileName: file,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  });
  assert.equal(
    diagnostics.length,
    0,
    `${file}: ${diagnostics.map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')).join('\n')}`,
  );
}
console.log(
  `Smoke check passed: Astro config, WebFinger and ${files.length} source files`,
);
