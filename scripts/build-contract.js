const fs = require("fs");
const path = require("path");

const FEED_FILES = ["rss.xml", "newsletter-pl-rss.xml"];

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];

  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(entryPath) : [entryPath];
  });
}

function readRequired(publicDirectory, relativePath) {
  const filePath = path.join(publicDirectory, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing generated file: public/${relativePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function uniqueSorted(values) {
  return Array.from(new Set(values)).sort();
}

function extractXmlValues(xml, tagName) {
  const pattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>([^<]+)</${tagName}>`, "g");
  return Array.from(xml.matchAll(pattern), (match) => match[1].replace(/&amp;/g, "&"));
}

function collectRoutes(publicDirectory) {
  return uniqueSorted(
    walkFiles(path.join(publicDirectory, "page-data"))
      .filter((filePath) => path.basename(filePath) === "page-data.json")
      .map((filePath) => JSON.parse(fs.readFileSync(filePath, "utf8")).path)
      .filter(Boolean)
  );
}

function collectRedirects(publicDirectory) {
  return uniqueSorted(
    readRequired(publicDirectory, "_redirects")
      .split(/\r?\n/)
      .map((line) => line.trim().replace(/\s+/g, " "))
      .filter((line) => line && !line.startsWith("#"))
  );
}

function collectSitemapUrls(publicDirectory) {
  const sitemapDirectory = path.join(publicDirectory, "sitemap");
  return uniqueSorted(
    walkFiles(sitemapDirectory)
      .filter((filePath) => /^sitemap-\d+\.xml$/.test(path.basename(filePath)))
      .flatMap((filePath) => extractXmlValues(fs.readFileSync(filePath, "utf8"), "loc"))
  );
}

function collectFeedEntries(publicDirectory) {
  return Object.fromEntries(
    FEED_FILES.map((feedFile) => [
      feedFile,
      uniqueSorted(extractXmlValues(readRequired(publicDirectory, feedFile), "guid")),
    ])
  );
}

function collectBuildContract(publicDirectory) {
  const routes = collectRoutes(publicDirectory);
  return {
    schemaVersion: 1,
    pageCount: routes.length,
    routes,
    redirects: collectRedirects(publicDirectory),
    sitemapUrls: collectSitemapUrls(publicDirectory),
    feedEntries: collectFeedEntries(publicDirectory),
  };
}

function compareValues(label, expected, actual, failures) {
  const expectedSet = new Set(expected);
  const actualSet = new Set(actual);
  const missing = expected.filter((value) => !actualSet.has(value));
  const unexpected = actual.filter((value) => !expectedSet.has(value));

  if (missing.length > 0) failures.push(`${label} missing: ${missing.join(", ")}`);
  if (unexpected.length > 0) failures.push(`${label} added: ${unexpected.join(", ")}`);
}

function compareBuildContracts(expected, actual) {
  const failures = [];

  if (expected.schemaVersion !== actual.schemaVersion) {
    failures.push(
      `Build-contract schema changed from ${expected.schemaVersion} to ${actual.schemaVersion}`
    );
  }
  if (expected.pageCount !== actual.pageCount) {
    failures.push(`Generated page count changed from ${expected.pageCount} to ${actual.pageCount}`);
  }

  compareValues("Routes", expected.routes, actual.routes, failures);
  compareValues("Redirects", expected.redirects, actual.redirects, failures);
  compareValues("Sitemap URLs", expected.sitemapUrls, actual.sitemapUrls, failures);

  const feedFiles = uniqueSorted([
    ...Object.keys(expected.feedEntries),
    ...Object.keys(actual.feedEntries),
  ]);
  for (const feedFile of feedFiles) {
    compareValues(
      `${feedFile} entries`,
      expected.feedEntries[feedFile] || [],
      actual.feedEntries[feedFile] || [],
      failures
    );
  }

  return failures;
}

module.exports = { collectBuildContract, compareBuildContracts };
