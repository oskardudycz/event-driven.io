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

  for (const utilityPage of ["en/account/index.html", "en/callback/index.html"]) {
    expectContains(utilityPage, read(utilityPage), 'name="robots" content="noindex, nofollow"');
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

  for (const excludedRoute of ["/en/account/", "/en/callback/", "/en/search/", "/404/"]) {
    expectExcludes("sitemap", sitemap, `<loc>https://event-driven.io${excludedRoute}</loc>`);
  }

  const llms = read("llms.txt");
  expectContains("llms.txt", llms, "https://event-driven.io/en/consulting/");
  expectContains("llms.txt", llms, "https://event-driven.io/pl/consulting/");
  expectContains("llms.txt", llms, "https://event-driven.io/en/introduction_to_event_sourcing/");
  expectContains("llms.txt", llms, "https://event-driven.io/sitemap/sitemap-index.xml");

  return failures;
}

module.exports = { verifySeoBuild };
