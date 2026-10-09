import path from 'path';
import { verifySeoBuild } from './seo-build-verifier.mts';

const publicDirectory = path.resolve(import.meta.dirname, '../public');
const failures = verifySeoBuild(publicDirectory);

if (failures.length > 0) {
  console.error('SEO build verification failed:\n');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('SEO build verification passed.');
