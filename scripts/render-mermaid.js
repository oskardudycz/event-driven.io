const { execFileSync } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");

const MERMAID_CLI = "@mermaid-js/mermaid-cli@12.0.0";
const CONFIG = path.join(__dirname, "mermaid-config.json");

async function listMermaidFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) return entry.name === "node_modules" ? [] : listMermaidFiles(fullPath);
      return entry.name.endsWith(".mmd") ? [fullPath] : [];
    }),
  );
  return files.flat();
}

async function findDiagrams(postDir) {
  const date = path.basename(postDir).match(/^(\d{4}-\d{2}-\d{2})--/)?.[1];
  if (!date) throw new Error(`Post folder ${postDir} must start with YYYY-MM-DD--`);

  const diagrams = (await listMermaidFiles(postDir)).map((source) => {
    const number = path.basename(source).match(/^(\d+)-/)?.[1];
    if (!number) throw new Error(`${path.basename(source)} must start with a number, e.g. 1-session-mode.mmd`);
    return { number: Number(number), source, output: path.join(postDir, `${date}-mermaid${number}.png`) };
  });

  return diagrams.sort((a, b) => a.number - b.number);
}

// Yarn exposes its own settings as npm_config_* variables, which make npx print "Unknown env config" warnings.
const withoutYarnNpmConfig = (env) =>
  Object.fromEntries(Object.entries(env).filter(([name]) => !name.toLowerCase().startsWith("npm_config_")));

async function main() {
  const postDir = process.argv[2];
  if (!postDir) {
    console.error("Usage: yarn render-diagrams content/posts/YYYY-MM-DD--slug");
    process.exit(1);
  }

  const diagrams = await findDiagrams(path.resolve(postDir));
  if (diagrams.length === 0) {
    console.error(`No .mmd files found in ${postDir}`);
    process.exit(1);
  }

  for (const { source, output } of diagrams) {
    console.log(`${path.relative(process.cwd(), source)} -> ${path.relative(process.cwd(), output)}`);
    execFileSync(
      "npx",
      ["-y", MERMAID_CLI, "-i", source, "-o", output, "-c", CONFIG, "-s", "3", "-b", "white", "-q"],
      { stdio: "inherit", env: withoutYarnNpmConfig(process.env) },
    );
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}

module.exports = { findDiagrams };
