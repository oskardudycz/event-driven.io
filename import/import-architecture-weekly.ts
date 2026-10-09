import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const repository = 'https://github.com/oskardudycz/ArchitectureWeekly.git';
const checkout = 'temp/ArchitectureWeekly';
const destination = 'content/architecture-weekly';

await mkdir('temp', { recursive: true });
await rm(checkout, { recursive: true, force: true });
execFileSync('git', ['clone', '--', repository, checkout], {
  stdio: 'inherit',
});
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await writeFile(`${destination}/.gitkeep`, '');
console.log('SUCCESS! ArchitectureWeekly checkout succeeded.');
