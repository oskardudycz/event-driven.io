const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { collectBuildContract, compareBuildContracts } = require("../scripts/build-contract");

const publicDirectory = path.resolve(__dirname, "../public");
const baselinePath = path.resolve(__dirname, "fixtures/build-contract.json");
const expected = JSON.parse(fs.readFileSync(baselinePath, "utf8"));
const actual = collectBuildContract(publicDirectory);
const failures = compareBuildContracts(expected, actual);

assert.deepStrictEqual(
  failures,
  [],
  `Generated build contract has regressions:\n${failures
    .map((failure) => `- ${failure}`)
    .join("\n")}`
);

console.log(`PASS generated build contract (${actual.pageCount} routes)`);
