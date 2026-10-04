import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync } from "node:child_process";

// Opt-in integration check. Use an existing article and its non-indexed Polish
// placeholder; never create test publications or add entries to llms.txt.
const manifest = JSON.parse(fs.readFileSync("import/architecture-weekly-missing.json", "utf8"));
const slug = new URL(manifest[0].url).pathname.split("/").filter(Boolean).pop();
const directory = fs.readdirSync("content/posts").find((name) => name.endsWith(`--${slug}`));
assert(directory, "Cache-check article not found");
const englishFile = path.join("content/posts", directory, "index.en.md");
const polishFile = path.join("content/posts", directory, "index.pl.md");
const english = fs.readFileSync(englishFile, "utf8");
const polish = fs.readFileSync(polishFile, "utf8");
assert(
  polish.includes("useDefaultLangCanonical: true"),
  "Deletion check must use a non-indexed placeholder"
);
const index = fs.readFileSync("static/llms.txt");
const logDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "gatsby-cache-check-"));
const marker = "Gatsby cache modification verification marker";
function build(label) {
  const log = path.join(logDirectory, `${label}.log`);
  const fd = fs.openSync(log, "w");
  console.log(`Building ${label}; log: ${log}`);
  try {
    const result = spawnSync("yarn", ["build"], {
      stdio: ["ignore", fd, fd],
      env: {
        ...process.env,
        ALGOLIA_SKIP_INDEXING: "true",
        GATSBY_CPU_COUNT: process.env.GATSBY_CPU_COUNT || "4",
      },
    });
    assert.equal(result.status, 0, `Build failed; inspect ${log}`);
  } finally {
    fs.closeSync(fd);
  }
}
const articleHtml = path.join("public/en", slug, "index.html");
const polishHtml = path.join("public/pl", slug, "index.html");
const polishData = path.join("public/page-data/pl", slug, "page-data.json");
try {
  fs.writeFileSync(englishFile, `${english}\n\n${marker}\n`);
  fs.unlinkSync(polishFile);
  build("modified-and-deleted");
  assert(
    fs.readFileSync(articleHtml, "utf8").includes(marker),
    "Warm cache ignored modified content"
  );
  assert(!fs.existsSync(polishData), "Warm cache retained deleted page data");
  assert(!fs.existsSync(polishHtml), "Warm cache retained deleted HTML");
  assert.deepEqual(
    fs.readFileSync("static/llms.txt"),
    index,
    "Cache check changed the publication index"
  );
} finally {
  fs.writeFileSync(englishFile, english);
  fs.writeFileSync(polishFile, polish);
  fs.writeFileSync("static/llms.txt", index);
  try {
    build("restored");
  } finally {
    fs.writeFileSync("static/llms.txt", index);
  }
}
assert(!fs.readFileSync(articleHtml, "utf8").includes(marker), "Warm cache retained removed text");
assert(
  fs.existsSync(polishData) && fs.existsSync(polishHtml),
  "Warm cache did not restore the page"
);
console.log(
  "Warm-cache modification, deletion and restoration passed; publication sources and index unchanged."
);
