const fs = require("fs");
const path = require("path");

function verifySeoBuild(publicDirectory) {
  const failures = [];

  function read(relativePath) {
    const filePath = path.join(publicDirectory, relativePath);

    if (!fs.existsSync(filePath)) {
      failures.push(`Missing generated file: public/${relativePath}`);
      return "";
    }

    return fs.readFileSync(filePath, "utf8");
  }

  function expectContains(label, content, expected) {
    if (!content.includes(expected)) {
      failures.push(`${label} does not contain: ${expected}`);
    }
  }

  function expectExcludes(label, content, unexpected) {
    if (content.includes(unexpected)) {
      failures.push(`${label} unexpectedly contains: ${unexpected}`);
    }
  }

  function verifyPage(relativePath, canonicalUrl, schemaType) {
    const html = read(relativePath);
    expectContains(relativePath, html, `rel="canonical" href="${canonicalUrl}"`);
    expectContains(relativePath, html, 'name="description" content="');
    expectContains(relativePath, html, `"@type":"${schemaType}"`);
    return html;
  }

  const consultingEn = verifyPage(
    "en/consulting/index.html",
    "https://event-driven.io/en/consulting/",
    "Service"
  );
  const consultingPl = verifyPage(
    "pl/consulting/index.html",
    "https://event-driven.io/pl/consulting/",
    "Service"
  );
  verifyPage(
    "en/category/event-sourcing/index.html",
    "https://event-driven.io/en/category/event-sourcing/",
    "CollectionPage"
  );
  verifyPage(
    "en/introduction_to_event_sourcing/index.html",
    "https://event-driven.io/en/introduction_to_event_sourcing/",
    "BlogPosting"
  );
  verifyPage("en/articles/index.html", "https://event-driven.io/en/articles/", "CollectionPage");
  verifyPage("pl/articles/index.html", "https://event-driven.io/pl/articles/", "CollectionPage");
  verifyPage("en/talks/index.html", "https://event-driven.io/en/talks/", "CollectionPage");

  for (const html of [consultingEn, consultingPl]) {
    expectContains("consulting language alternates", html, 'hrefLang="x-default"');
    expectContains("consulting language alternates", html, 'hrefLang="en"');
    expectContains("consulting language alternates", html, 'hrefLang="pl"');
  }

  for (const retiredPage of [
    "en/account/index.html",
    "pl/account/index.html",
    "en/account/billing/index.html",
    "pl/account/billing/index.html",
    "en/callback/index.html",
    "pl/callback/index.html",
  ]) {
    if (fs.existsSync(path.join(publicDirectory, retiredPage))) {
      failures.push(`Retired sign-in page still generated: public/${retiredPage}`);
    }
  }

  const robots = read("robots.txt");
  expectContains("robots.txt", robots, "User-agent: *");
  expectContains("robots.txt", robots, "Allow: /");
  expectContains(
    "robots.txt",
    robots,
    "Sitemap: https://event-driven.io/sitemap/sitemap-index.xml"
  );

  const sitemapIndex = read("sitemap/sitemap-index.xml");
  expectContains(
    "sitemap index",
    sitemapIndex,
    "<loc>https://event-driven.io/sitemap/sitemap-0.xml</loc>"
  );

  const sitemap = read("sitemap/sitemap-0.xml");
  const sitemapUrls = Array.from(sitemap.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => match[1]);
  // A page and a post currently claim the same anti-patterns route. Keep this exception explicit
  // until the editorial owner of that URL is chosen; every other sitemap canonical must self-match.
  const knownCanonicalExceptions = new Map([
    [
      "https://event-driven.io/pl/anti-patterns/",
      "https://event-driven.io/en/anti-patterns/",
    ],
  ]);
  if (new Set(sitemapUrls).size !== sitemapUrls.length) {
    failures.push("sitemap contains duplicate URLs");
  }

  for (const sitemapUrl of sitemapUrls) {
    const pathname = new URL(sitemapUrl).pathname;
    const relativePath = pathname.endsWith("/")
      ? `${pathname.slice(1)}index.html`
      : pathname.slice(1);
    const html = read(relativePath);
    const expectedCanonical = knownCanonicalExceptions.get(sitemapUrl) || sitemapUrl;
    expectContains(relativePath, html, `rel="canonical" href="${expectedCanonical}"`);
  }

  for (const publicRoute of [
    "/en/consulting/",
    "/pl/consulting/",
    "/en/articles/",
    "/pl/articles/",
    "/en/category/event-sourcing/",
    "/en/introduction_to_event_sourcing/",
    "/en/talks/",
  ]) {
    expectContains("sitemap", sitemap, `<loc>https://event-driven.io${publicRoute}</loc>`);
  }

  for (const excludedRoute of [
    "/en/account/",
    "/pl/account/",
    "/en/account/billing/",
    "/pl/account/billing/",
    "/en/callback/",
    "/pl/callback/",
    "/en/search/",
    "/404/",
  ]) {
    expectExcludes("sitemap", sitemap, `<loc>https://event-driven.io${excludedRoute}</loc>`);
  }

  const llms = read("llms.txt");
  expectContains("llms.txt", llms, "https://event-driven.io/en/consulting/");
  expectContains("llms.txt", llms, "https://event-driven.io/pl/consulting/");
  expectContains("llms.txt", llms, "https://event-driven.io/en/introduction_to_event_sourcing/");
  expectContains("llms.txt", llms, "https://event-driven.io/sitemap/sitemap-index.xml");

  const headers = read("_headers");
  expectContains("_headers", headers, "X-Frame-Options: DENY");
  expectContains("_headers", headers, "X-Content-Type-Options: nosniff");
  expectContains("_headers", headers, "/llms.txt");
  expectContains("_headers", headers, "Content-Type: text/plain; charset=UTF-8");

  return failures;
}

module.exports = { verifySeoBuild };
