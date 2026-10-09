import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { pathToFileURL } from 'node:url';
import {
  origin,
  prepare,
  validateManifest,
  type Manifest,
} from './indexnow/manifest.ts';
import { notify } from './indexnow/submission.ts';

async function atomicState(file: string, manifest: Manifest) {
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.tmp`;
  await writeFile(temporary, `${JSON.stringify(manifest, null, 2)}\n`);
  await rename(temporary, file);
}
async function readState(file: string): Promise<Manifest | undefined> {
  try {
    return validateManifest(JSON.parse(await readFile(file, 'utf8')));
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !('code' in error) ||
      error.code !== 'ENOENT'
    )
      throw error;
    return undefined;
  }
}

export async function restoreProductionBaseline(file: string, request = fetch) {
  if (await readState(file)) {
    console.log('Retaining the last acknowledged production state.');
    return;
  }
  const response = await request(`${origin}/indexnow-manifest.json`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(30000),
  });
  if (response.status === 404) {
    console.log(
      'No previous production manifest: first deployment will establish the baseline.',
    );
    return;
  }
  if (response.status !== 200)
    throw new Error(
      `Cannot read the previous production manifest: HTTP ${response.status}`,
    );
  await atomicState(file, validateManifest(await response.json()));
  console.log(
    'Acknowledgement cache unavailable: comparing with the previous production deployment.',
  );
}
async function main() {
  const { values } = parseArgs({
    options: {
      prepare: { type: 'boolean' },
      restore: { type: 'boolean' },
      submit: { type: 'boolean' },
      'dry-run': { type: 'boolean' },
      url: { type: 'string', multiple: true },
      state: { type: 'string', default: '.indexnow/submitted.json' },
      help: { type: 'boolean' },
    },
  });
  if (values.help) {
    console.log(
      'yarn indexnow:prepare\nyarn indexnow --restore (before deploying, when acknowledgement state is unavailable)\nyarn indexnow [--dry-run] [--state FILE] [--url /en/slug/]\nyarn indexnow --submit (only after production deployment)',
    );
    return;
  }
  if (values.submit && values['dry-run'])
    throw new Error('Choose --submit or --dry-run');
  if (
    [values.prepare, values.restore, values.submit].filter(Boolean).length > 1
  )
    throw new Error('Choose one operation: --prepare, --restore or --submit');
  const file = resolve(values.state);
  if (values.restore) {
    await restoreProductionBaseline(file);
    return;
  }
  if (values.prepare) {
    const manifest = await prepare();
    console.log(
      `Prepared ${Object.keys(manifest.pages).length} canonical pages.`,
    );
    return;
  }
  const current = validateManifest(
    JSON.parse(await readFile('public/indexnow-manifest.json', 'utf8')),
  );
  const { key }: { key: string } = JSON.parse(
    await readFile('data/indexnow.json', 'utf8'),
  ) as {
    key: string;
  };
  const previous = await readState(file);
  await notify({
    current,
    ...(previous ? { previous } : {}),
    key,
    ...(values.submit !== undefined ? { submit: values.submit } : {}),
    ...(values.url ? { urls: values.url } : {}),
    save: (manifest) => atomicState(file, manifest),
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
