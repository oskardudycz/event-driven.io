import { afterAll, beforeAll, expect, test } from "vitest";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.VISUAL_BASE_URL || "http://127.0.0.1:9000";
const updateSnapshots = process.env.UPDATE_VISUAL_SNAPSHOTS === "1";
const artifacts = join(process.cwd(), "visual-artifacts");
const snapshots = join(process.cwd(), "tests", "fixtures", "visual");
let browser;

beforeAll(async () => {
  await mkdir(artifacts, { recursive: true });
  browser = await chromium.launch();
}, 30_000);

afterAll(async () => {
  await browser?.close();
});

async function compareScreenshot(page, name, options = {}) {
  const screenshot = await page.screenshot(options);
  await writeFile(join(artifacts, `${name}.png`), screenshot);
  const referencePath = join(snapshots, `${name}.png`);
  if (updateSnapshots) {
    await mkdir(snapshots, { recursive: true });
    await writeFile(referencePath, screenshot);
    return;
  }

  const expected = PNG.sync.read(await readFile(referencePath));
  const current = PNG.sync.read(screenshot);
  expect([current.width, current.height]).toEqual([expected.width, expected.height]);
  const difference = new PNG({ width: current.width, height: current.height });
  const differentPixels = pixelmatch(
    expected.data, current.data, difference.data, current.width, current.height,
    { threshold: 0.2 }
  );
  const differenceRatio = differentPixels / (current.width * current.height);
  if (differenceRatio > 0.03) {
    await writeFile(join(artifacts, `${name}-diff.png`), PNG.sync.write(difference));
  }
  expect(differenceRatio).toBeLessThanOrEqual(0.03);
}

async function inspectArchive() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const response = await page.goto(new URL("/en/articles/", baseUrl).href, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    const firstCover = page.locator(".gatsby-image-wrapper img[data-main-image]").first();
    await firstCover.waitFor();
    await page.waitForFunction(
      (image) => image.complete && image.naturalWidth >= 200,
      await firstCover.elementHandle(),
      { timeout: 15_000 }
    );
    await page.waitForFunction(
      (image) => getComputedStyle(image).opacity === "1",
      await firstCover.elementHandle(),
      { timeout: 5_000 }
    );
    await page.evaluate(() => document.fonts.ready);
    await compareScreenshot(page, "articles-desktop");
    return {
      headings: await page.locator("h1").count(),
      headingTop: await page.locator("h1").first().evaluate((heading) => heading.getBoundingClientRect().top),
      footers: await page.locator("footer").count(),
      firstCoverWidth: await firstCover.evaluate((image) => image.naturalWidth),
    };
  } finally {
    await page.screenshot({ path: join(artifacts, "articles-desktop.png") }).catch(() => {});
    await page.close();
  }
}

test("article archive hydrates once and displays its real cover image", async () => {
  const current = await inspectArchive();
  expect(current.headings).toBe(1);
  expect(current.headingTop).toBeGreaterThanOrEqual(80);
  expect(current.footers).toBe(1);
  expect(current.firstCoverWidth).toBeGreaterThanOrEqual(200);
}, 60_000);

async function inspectCategories() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const response = await page.goto(new URL("/en/category/", baseUrl).href, {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBe(200);
    await page.locator(".categoryGrid section").first().waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    await compareScreenshot(page, "category-desktop");
    return {
      headings: await page.locator("h1").count(),
      footers: await page.locator("footer").count(),
      cards: await page.locator(".categoryGrid section").count(),
      scrollY: await page.evaluate(() => window.scrollY),
    };
  } finally {
    await page.screenshot({ path: join(artifacts, "category-desktop.png") }).catch(() => {});
    await page.close();
  }
}

test("category index hydrates once and starts at the top", async () => {
  const current = await inspectCategories();
  expect(current.headings).toBe(1);
  expect(current.footers).toBe(1);
  expect(current.cards).toBeGreaterThan(2);
  expect(current.scrollY).toBeLessThan(5);
}, 60_000);

test("client-side archive navigation keeps a single page at the top", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(new URL("/en/", baseUrl).href, { waitUntil: "domcontentloaded" });
    await page.locator('a[href="/en/articles/"]').first().click();
    await page.waitForURL("**/en/articles/");
    await page.locator(".gatsby-image-wrapper img[data-main-image]").first().waitFor();
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
    expect(await page.locator("h1").count()).toBe(1);
    expect(await page.locator("footer").count()).toBe(1);
  } finally {
    await page.close();
  }
}, 30_000);

test("article footer shows the author bio and links to further reading", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const response = await page.goto(
      new URL("/en/vertical-slices-and-dependencies/", baseUrl).href,
      { waitUntil: "domcontentloaded" }
    );
    expect(response?.status()).toBe(200);
    const author = page.locator(".author");
    await author.waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);
    const bio = await author.locator(".note").innerText();
    expect(bio).toContain("Oskar Dudycz is an independent software architect");
    expect(bio).not.toContain("Through my window");
    expect(bio.length).toBeLessThan(500);
    const furtherReading = page.locator(".author + .links");
    expect(await page.locator("article footer > .substack + .related").count()).toBe(1);
    const spacing = await page.evaluate(() => {
      const iframe = document.querySelector(".substack iframe");
      const related = document.querySelector(".related");
      return {
        gap: related.getBoundingClientRect().top - iframe.getBoundingClientRect().bottom,
        border: getComputedStyle(related).borderTopWidth,
      };
    });
    expect(spacing.border).toBe("0px");
    expect(spacing.gap).toBeGreaterThanOrEqual(0);
    expect(spacing.gap).toBeLessThanOrEqual(30);
    expect(await page.locator(".related a").evaluateAll((links) => links.map((link) => link.getAttribute("href"))))
      .toEqual([
        "/en/how_to_slice_the_codebase_effectively/",
        "/en/vertical_slices_in_practice/",
      ]);
    const firstCover = page.locator(".related img").first();
    expect(await firstCover.getAttribute("alt")).toBe("");
    await page.locator(".related").scrollIntoViewIfNeeded();
    await page.waitForFunction((image) => image.complete && image.naturalWidth >= 200,
      await firstCover.elementHandle());
    await page.evaluate(() => {
      const top = document.querySelector(".related").getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 100);
    });
    await compareScreenshot(page, "article-related-desktop", { animations: "disabled" });
    expect(await furtherReading.locator("a").count()).toBeGreaterThan(0);
    expect(await furtherReading.locator("a").first().getAttribute("href")).toMatch(/^\/en\//);
    expect(await furtherReading.getAttribute("aria-label")).toBe("Articles by publication date");
    expect(await furtherReading.innerText()).toContain("Earlier article");
    const relatedLink = page.locator(".related a").first();
    await relatedLink.focus();
    expect(await relatedLink.evaluate((link) => getComputedStyle(link).outlineStyle)).toBe("solid");
    await compareScreenshot(author, "article-footer-desktop", { animations: "disabled" });
  } finally {
    await page.close();
  }
}, 60_000);

test("articles without curated recommendations do not show a related block", async () => {
  const page = await browser.newPage();
  try {
    const response = await page.goto(
      new URL("/en/checkpointing_message_processing/", baseUrl).href,
      { waitUntil: "domcontentloaded" }
    );
    expect(response?.status()).toBe(200);
    expect(await page.locator(".related").count()).toBe(0);
  } finally {
    await page.close();
  }
}, 30_000);

test("curated article links fit on a narrow screen", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  try {
    await page.goto(new URL("/en/vertical-slices-and-dependencies/", baseUrl).href, {
      waitUntil: "domcontentloaded",
    });
    await page.locator(".related a").first().waitFor({ state: "visible" });
    const width = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(width).toBeLessThanOrEqual(390);
    expect(await page.locator(".related a").count()).toBe(2);
    await page.locator(".related img").last().scrollIntoViewIfNeeded();
    await page.locator(".related img").first().scrollIntoViewIfNeeded();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(Array.from(document.querySelectorAll(".related img"), (image) => image.decode()));
    });
    await page.evaluate(() => {
      const top = document.querySelector(".related").getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 80);
    });
    await compareScreenshot(page, "article-related-mobile", { animations: "disabled" });
  } finally {
    await page.close();
  }
}, 30_000);

for (const language of ["en", "pl"]) {
  test(`${language} homepage renders one complete hero`, async () => {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      const response = await page.goto(new URL(`/${language}/`, baseUrl).href, {
        waitUntil: "domcontentloaded",
      });
      expect(response?.status()).toBe(200);
      await page.locator(".hero h1").waitFor({ state: "visible" });
      await page.evaluate(async () => {
        await document.fonts.ready;
        const background = getComputedStyle(document.querySelector(".hero")).backgroundImage;
        const url = background.match(/^url\(["']?(.*?)["']?\)$/)?.[1];
        if (!url) throw new Error("Homepage hero background is missing");
        const image = new Image();
        image.src = url;
        await image.decode();
      });
      await page.waitForTimeout(1000);
      await compareScreenshot(page, `home-${language}-desktop`, { animations: "disabled" });
      expect(await page.locator(".hero h1").count()).toBe(1);
      expect(await page.locator("footer").count()).toBe(1);
      expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
    } finally {
      await page.screenshot({
        path: join(artifacts, `home-${language}-desktop.png`),
        animations: "disabled",
      }).catch(() => {});
      await page.close();
    }
  }, 60_000);
}

test("Gatsby Head replaces metadata during navigation and keeps language-specific titles", async () => {
  const page = await browser.newPage();
  try {
    for (const [language, title] of [["en", "All articles"], ["pl", "Wszystkie artykuły"]]) {
      await page.goto(new URL(`/${language}/articles/`, baseUrl).href, { waitUntil: "domcontentloaded" });
      await page.waitForFunction((expected) => document.title.startsWith(expected), title);
      expect(await page.locator('head link[rel="canonical"]').count()).toBe(1);
      expect(await page.locator('head link[rel="canonical"]').getAttribute("href"))
        .toBe(`https://event-driven.io/${language}/articles/`);
      expect(await page.locator("html").getAttribute("lang")).toBe(language);
      expect(await page.locator("h1").innerText()).toBe(title);
      expect(await page.locator('head script[type="application/ld+json"]').count()).toBe(1);
    }
    await page.goto(new URL("/en/articles/", baseUrl).href, { waitUntil: "domcontentloaded" });
    const link = page.locator(".main li a.link").first();
    const articlePath = await link.getAttribute("href");
    await link.click();
    await page.waitForURL(`**${articlePath}`);
    await page.waitForFunction(() => {
      const script = document.querySelector('head script[type="application/ld+json"]');
      return script && JSON.parse(script.textContent)["@type"] === "BlogPosting";
    });
    expect(await page.locator('head link[rel="canonical"]').count()).toBe(1);
    expect(await page.locator('head link[rel="canonical"]').getAttribute("href"))
      .toBe(`https://event-driven.io${articlePath}`);
    expect(await page.locator('head meta[name="description"]').count()).toBe(1);
    expect(await page.locator('head link[href="/fonts/open-sans/index.css"]').count()).toBe(1);
    expect(await page.title()).not.toContain("All articles");
  } finally { await page.close(); }
}, 60_000);

test("layout keeps fonts, sticky header and mobile navigation after resizing", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    await page.goto(new URL("/en/articles/", baseUrl).href);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => getComputedStyle(document.body).fontFamily.includes("Open Sans"));
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForFunction(() => document.querySelector("header").classList.contains("fixed"));
    await page.setViewportSize({ width: 390, height: 844 });
    const expand = page.getByRole("button", { name: "expand" });
    await expand.waitFor({ state: "visible" });
    await expand.click();
    expect(await page.locator("nav.menu").evaluate((menu) => menu.classList.contains("open"))).toBe(true);
    await page.locator('nav.menu a[data-slug="/contact/"]').click();
    await page.waitForURL("**/en/contact/");
    await page.waitForFunction(() => !document.querySelector("nav.menu").classList.contains("open"));
    expect(await page.locator("h1").count()).toBe(1);
    expect(await page.locator("footer").count()).toBe(1);
  } finally {
    await page.close();
  }
}, 60_000);

test("article language switch stays visible before and after scrolling", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  try {
    const slug = "fractal-architecture-cognitive-load";
    await page.goto(new URL(`/en/${slug}/`, baseUrl).href);
    const polish = page.getByRole("link", { name: "Change language to pl" });
    await polish.waitFor({ state: "visible" });
    await page.evaluate(() => window.scrollTo(0, 600));
    await page.waitForFunction(() => document.querySelector("header").classList.contains("fixed"));
    expect(await polish.isVisible()).toBe(true);
    await polish.click();
    await page.waitForURL(`**/pl/${slug}/`);
    await page.waitForFunction(() => document.documentElement.lang === "pl");
    const english = page.getByRole("link", { name: "Change language to en" });
    await english.waitFor({ state: "visible" });
    await page.setViewportSize({ width: 390, height: 844 });
    await english.waitFor({ state: "visible" });
    await english.click();
    await page.waitForURL(`**/en/${slug}/`);
    expect(await page.locator("h1").count()).toBe(1);
  } finally { await page.close(); }
}, 60_000);

test("imported TypeScript examples display syntax colors", async () => {
  const page = await browser.newPage();
  try {
    await page.goto(new URL('/en/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention/', baseUrl).href);
    const keyword = page.locator('pre.language-typescript .token.keyword').first();
    await keyword.waitFor({ state: 'visible' });
    const colors = await keyword.evaluate(token => ({ keyword: getComputedStyle(token).color, code: getComputedStyle(token.closest('code')).color }));
    expect(colors.keyword).not.toBe(colors.code);
  } finally { await page.close(); }
}, 60_000);
