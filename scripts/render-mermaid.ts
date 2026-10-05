import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MERMAID_CLI = '@mermaid-js/mermaid-cli@12.0.0';
const CONFIG = join(import.meta.dirname, 'mermaid-config.json');

export type Diagram = { number: number; source: string; output: string };

async function listMermaidFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = join(directory, entry.name);
      if (entry.isDirectory())
        return entry.name === 'node_modules' ? [] : listMermaidFiles(fullPath);
      return entry.name.endsWith('.mmd') ? [fullPath] : [];
    }),
  );
  return files.flat();
}

export async function findDiagrams(postDir: string): Promise<Diagram[]> {
  const date = basename(postDir).match(/^(\d{4}-\d{2}-\d{2})--/)?.[1];
  if (!date)
    throw new Error(`Post folder ${postDir} must start with YYYY-MM-DD--`);

  const diagrams = (await listMermaidFiles(postDir)).map((source) => {
    const number = basename(source).match(/^(\d+)-/)?.[1];
    if (!number)
      throw new Error(
        `${basename(source)} must start with a number, e.g. 1-session-mode.mmd`,
      );
    return {
      number: Number(number),
      source,
      output: join(postDir, `${date}-mermaid${number}.png`),
    };
  });

  return diagrams.sort((a, b) => a.number - b.number);
}

function renderDiagram({ source, output }: Diagram) {
  console.log(
    `${relative(process.cwd(), source)} -> ${relative(process.cwd(), output)}`,
  );
  execFileSync(
    'npx',
    [
      '-y',
      MERMAID_CLI,
      '-i',
      source,
      '-o',
      output,
      '-c',
      CONFIG,
      '-s',
      '3',
      '-b',
      'white',
      '-q',
    ],
    { stdio: 'inherit' },
  );
}

async function main() {
  const postDir = process.argv[2];
  if (!postDir) {
    console.error(
      'Usage: npm run render-diagrams content/posts/YYYY-MM-DD--slug',
    );
    process.exitCode = 1;
    return;
  }

  const diagrams = await findDiagrams(resolve(postDir));
  if (diagrams.length === 0) {
    console.error(`No .mmd files found in ${postDir}`);
    process.exitCode = 1;
    return;
  }

  for (const diagram of diagrams) renderDiagram(diagram);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
