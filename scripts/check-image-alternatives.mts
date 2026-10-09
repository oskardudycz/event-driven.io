import { globSync, readFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';
import { imageIssues } from './image-alternatives.mts';

const inputs = process.argv.slice(2);
const paths = inputs.length
  ? inputs
      .map((file) => relative(process.cwd(), resolve(file)))
      .filter((file) => file.startsWith(`content${sep}`) && file.endsWith('.md'))
  : globSync('content/**/*.md');
let errors = 0;
for (const file of paths) {
  for (const issue of imageIssues(readFileSync(file, 'utf8'))) {
    console.error(`${file}:${issue.line}: ${issue.message}: ${issue.url}`);
    errors++;
  }
}
console.log(`Checked image alternatives in ${paths.length} Markdown files; ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
