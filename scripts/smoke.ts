import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import ts from 'typescript';

import config from '../site/config.ts';
import graphql from 'gatsby/graphql.js';
const { parse } = graphql;

assert.equal(config.trailingSlash, 'always');
assert.ok(config.siteMetadata.siteUrl);
assert.ok(Array.isArray(config.plugins));

const webfinger = JSON.parse(
  readFileSync('static/.well-known/webfinger', 'utf8'),
) as {
  subject: string;
};
assert.equal(webfinger.subject, 'acct:oskardudycz@hachyderm.io');

const files = [
  'site/config.ts',
  'site/node.ts',
  ...globSync('src/**/*.{ts,tsx}').filter((file) => !file.endsWith('.d.ts')),
];
let queryCount = 0;

function checkTemplate(template: ts.Node, file: string, tagged = false) {
  assert.ok(
    ts.isNoSubstitutionTemplateLiteral(template),
    `GraphQL interpolation in ${file}`,
  );
  parse(tagged ? template.getText().slice(1, -1) : template.text);
  queryCount += 1;
}

function walk(node: ts.Node, file: string) {
  if (ts.isTaggedTemplateExpression(node) && node.tag.getText() === 'graphql') {
    checkTemplate(node.template, file, true);
  } else if (
    ts.isCallExpression(node) &&
    (node.expression.getText() === 'graphql' ||
      (ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'graphql')) &&
    node.arguments[0] &&
    ts.isTemplateLiteral(node.arguments[0])
  ) {
    checkTemplate(node.arguments[0], file);
  } else if (
    ts.isPropertyAssignment(node) &&
    node.name.getText() === 'query' &&
    ts.isTemplateLiteral(node.initializer)
  ) {
    checkTemplate(node.initializer, file);
  } else if (
    ts.isVariableDeclaration(node) &&
    node.name.getText() === 'query' &&
    node.initializer &&
    ts.isTemplateLiteral(node.initializer)
  ) {
    checkTemplate(node.initializer, file);
  }
  ts.forEachChild(node, (child) => walk(child, file));
}

for (const file of files) {
  const source = readFileSync(file, 'utf8');
  const { diagnostics = [] } = ts.transpileModule(source, {
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
    `${file}: ${diagnostics.map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n')).join('\n')}`,
  );
  walk(ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true), file);
}

assert.ok(queryCount > 0, 'No GraphQL queries were found');
console.log(
  `Smoke check passed: Gatsby config, WebFinger, ${files.length} source files, ${queryCount} GraphQL queries`,
);
