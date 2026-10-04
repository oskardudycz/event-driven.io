const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const config = require("../gatsby-config");
const buildHeaders = require("gatsby-plugin-netlify/build-headers-program").default;
const { DEFAULT_OPTIONS } = require("gatsby-plugin-netlify/constants");

test("Netlify output sends the referrer YouTube requires and keeps other headers", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "video-headers-"));
  const plugin = config.plugins.find((entry) => entry.resolve === "gatsby-plugin-netlify");
  try {
    await buildHeaders({
      manifest: {}, pages: [], pathPrefix: "", publicFolder: (file) => path.join(directory, file),
    }, { ...DEFAULT_OPTIONS, ...plugin.options }, { warn: (message) => { throw new Error(message); } });
    const headers = await fs.readFile(path.join(directory, "_headers"), "utf8");
    assert.match(headers, /\/\*\n(?:  [^\n]+\n)*  Referrer-Policy: strict-origin-when-cross-origin\n/);
    assert.doesNotMatch(headers, /Referrer-Policy: same-origin/);
    assert.equal((headers.match(/Referrer-Policy:/g) || []).length, 1);
    assert.match(headers, /X-Frame-Options: DENY/);
    assert.match(headers, /X-Content-Type-Options: nosniff/);
    assert.match(headers, /Content-Type: text\/plain; charset=UTF-8/);
  } finally { await fs.rm(directory, { recursive: true, force: true }); }
});
