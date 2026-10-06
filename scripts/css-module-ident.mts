import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';

type LoaderContext = {
  resourcePath: string;
  addDependency(_file: string): void;
  addContextDependency(_directory: string): void;
};

// Gatsby extracts shared CSS but can reuse HTML when only declarations change.
// Include the stylesheet contents in JS class exports so every affected page's
// renderer changes too, including pages sharing the common extracted CSS chunk.
export function createCssModuleIdent(root: string) {
  return (context: LoaderContext, _template: string, localName: string) => {
    const hash = createHash('sha256');
    const source = join(root, 'src');
    context.addContextDependency(source);
    function include(directory: string) {
      for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
        a.name.localeCompare(b.name),
      )) {
        const file = join(directory, entry.name);
        if (entry.isDirectory()) include(file);
        else if (entry.name.endsWith('.css')) {
          context.addDependency(file);
          hash.update(relative(root, file).replaceAll('\\', '/'));
          hash.update('\0');
          hash.update(readFileSync(file));
          hash.update('\0');
        }
      }
    }
    include(source);
    hash.update(relative(root, context.resourcePath).replaceAll('\\', '/'));
    hash.update(`\0${localName}`);
    return `${basename(context.resourcePath, '.css')}--${localName}--${hash.digest('hex').slice(0, 8)}`;
  };
}

export const getCssModuleIdent = createCssModuleIdent(resolve(import.meta.dirname, '..'));
