const fs = require("fs");
const path = require("path");
const { collectBuildContract, compareBuildContracts } = require("./build-contract");

const publicDirectory = path.resolve(__dirname, "../public");
const baselinePath = path.resolve(__dirname, "../tests/fixtures/build-contract.json");

if (!fs.existsSync(baselinePath)) {
  console.error("Missing tests/fixtures/build-contract.json. Run yarn update:build-contract.");
  process.exit(1);
}

const expected = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const actual = collectBuildContract(publicDirectory);
const failures = compareBuildContracts(expected, actual);

if (failures.length > 0) {
  console.error("Build-contract verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  console.error("\nIf these output changes are intentional, run yarn update:build-contract and review the diff.");
  process.exit(1);
}

console.log(
  `Build contract passed: ${actual.pageCount} routes, ${actual.redirects.length} redirects, ` +
    `${actual.sitemapUrls.length} sitemap URLs.`
);
