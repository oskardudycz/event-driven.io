const path = require("path");
const { verifySeoBuild } = require("./seo-build-verifier");

const publicDirectory = path.resolve(__dirname, "../public");
const failures = verifySeoBuild(publicDirectory);

if (failures.length > 0) {
  console.error("SEO build verification failed:\n");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("SEO build verification passed.");
