const fs = require("fs");
const path = require("path");
const { collectBuildContract } = require("./build-contract");

const publicDirectory = path.resolve(__dirname, "../public");
const baselinePath = path.resolve(__dirname, "../tests/fixtures/build-contract.json");
const contract = collectBuildContract(publicDirectory);

fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
fs.writeFileSync(baselinePath, `${JSON.stringify(contract, null, 2)}\n`);

console.log(
  `Updated build contract: ${contract.pageCount} routes, ${contract.redirects.length} redirects, ` +
    `${contract.sitemapUrls.length} sitemap URLs.`
);
