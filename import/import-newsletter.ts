import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const repository =
  process.env.NEWSLETTER_REPO_URL ||
  'https://github.com/oskardudycz/event-sourcing-newsletter.git';
const checkout = 'temp/event-sourcing-newsletter';
const destination = 'content/newsletter-pl';

await mkdir('temp', { recursive: true });
await rm(checkout, { recursive: true, force: true });
execFileSync('git', ['clone', '--', repository, checkout], {
  stdio: 'inherit',
});
await rm(destination, { recursive: true, force: true });
await cp(`${checkout}/content/posts`, destination, { recursive: true });
await writeFile(`${destination}/.gitkeep`, '');
console.log('SUCCESS! Newsletter import succeeded.');
