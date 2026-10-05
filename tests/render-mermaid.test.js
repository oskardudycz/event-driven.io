const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const { findDiagrams } = require("../scripts/render-mermaid.js");

test("diagram sources are mapped to the post's mermaid PNG names by their number prefix", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "render-mermaid-"));
  const postDir = path.join(root, "2026-10-12--some-post");
  try {
    await fs.mkdir(path.join(postDir, "code/diagrams"), { recursive: true });
    await fs.mkdir(path.join(postDir, "code/node_modules/pkg"), { recursive: true });
    await fs.writeFile(path.join(postDir, "code/diagrams/2-transaction-mode.mmd"), "");
    await fs.writeFile(path.join(postDir, "code/diagrams/10-later.mmd"), "");
    await fs.writeFile(path.join(postDir, "code/diagrams/1-session-mode.mmd"), "");
    await fs.writeFile(path.join(postDir, "code/node_modules/pkg/1-ignored.mmd"), "");

    const diagrams = await findDiagrams(postDir);

    assert.deepEqual(
      diagrams.map(({ source, output }) => [path.relative(postDir, source), path.relative(postDir, output)]),
      [
        ["code/diagrams/1-session-mode.mmd", "2026-10-12-mermaid1.png"],
        ["code/diagrams/2-transaction-mode.mmd", "2026-10-12-mermaid2.png"],
        ["code/diagrams/10-later.mmd", "2026-10-12-mermaid10.png"],
      ],
    );
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("diagram sources without a number prefix are rejected", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "render-mermaid-"));
  const postDir = path.join(root, "2026-10-12--some-post");
  try {
    await fs.mkdir(postDir, { recursive: true });
    await fs.writeFile(path.join(postDir, "session-mode.mmd"), "");

    await assert.rejects(findDiagrams(postDir), /session-mode\.mmd must start with a number/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});

test("post folders without a date prefix are rejected", async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "render-mermaid-"));
  try {
    await assert.rejects(findDiagrams(root), /must start with YYYY-MM-DD--/);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
});
