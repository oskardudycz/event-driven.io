const assert = require("assert");
const path = require("path");
const { verifySeoBuild } = require("../scripts/seo-build-verifier");

const publicDirectory = path.resolve(__dirname, "../public");
const failures = verifySeoBuild(publicDirectory);

assert.deepStrictEqual(
  failures,
  [],
  `Generated SEO output has regressions:\n${failures.map((failure) => `- ${failure}`).join("\n")}`
);

console.log("PASS generated SEO output");
