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

async function compareScreenshot(page, name) {
  const screenshot = await page.screenshot();
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
    const firstCover = page.locator(".gatsby-image-wrapper > picture img").first();
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
    await page.locator(".gatsby-image-wrapper > picture img").first().waitFor();
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
    expect(await page.locator("h1").count()).toBe(1);
    expect(await page.locator("footer").count()).toBe(1);
  } finally {
    await page.close();
  }
}, 30_000);
