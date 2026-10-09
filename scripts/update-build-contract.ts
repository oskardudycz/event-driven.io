import fs from 'fs';
import path from 'path';
import { collectBuildContract } from './build-contract.ts';

const publicDirectory = path.resolve(import.meta.dirname, '../public');
const baselinePath = path.resolve(import.meta.dirname, '../tests/fixtures/build-contract.json');
const contract = collectBuildContract(publicDirectory);

fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
fs.writeFileSync(baselinePath, `${JSON.stringify(contract, null, 2)}\n`);

console.log(
  `Updated build contract: ${contract.pageCount} routes, ${contract.redirects.length} redirects, ` +
    `${contract.sitemapUrls.length} sitemap URLs.`,
);
