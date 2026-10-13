import { readFileSync } from 'node:fs';
import type { BuildPageData } from '../helpers/build-output.ts';
import { test, expect } from '../helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectImageLoaded,
} from '../helpers/browser/readiness.ts';

test('author biography renders a readable note and loaded portrait', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/en/vertical-slices-and-dependencies/');
  const author = page.locator('.author');
  await expectFonts(page);
  await expect(author.locator('.note')).not.toBeEmpty();
  const portrait = author.locator('img');
  await expectImageLoaded(portrait);
  await expect(portrait).toHaveAttribute('alt', /\S/);
  const note = author.locator('.note');
  await expect(note).toHaveCSS('font-family', '"Open Sans", sans-serif');
  const avatarBox = (await author.locator('.avatar').boundingBox())!;
  const noteBox = (await note.boundingBox())!;
  expect(noteBox.x).toBeGreaterThanOrEqual(avatarBox.x + avatarBox.width);
  expect(noteBox.width).toBeGreaterThan(0);
});

test('related articles and publication navigation remain usable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto('/en/vertical-slices-and-dependencies/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(200);
  await expectFonts(page);
  await expect(page.locator('.related h2')).toHaveCSS('font-weight', '600');
  const furtherReading = page.locator('.author + .links');
  await expect(
    page.locator('article footer > .substack + .related'),
  ).toHaveCount(1);
  const spacing = await page.evaluate(() => {
    const iframe = document.querySelector('.substack iframe')!;
    const related = document.querySelector('.related')!;
    return {
      gap:
        related.getBoundingClientRect().top -
        iframe.getBoundingClientRect().bottom,
      border: getComputedStyle(related).borderTopWidth,
    };
  });
  expect(spacing.border).toBe('0px');
  expect(spacing.gap).toBeGreaterThanOrEqual(0);
  expect(spacing.gap).toBeLessThanOrEqual(30);
  const data = JSON.parse(
    readFileSync(
      'public/page-data/en/vertical-slices-and-dependencies/page-data.json',
      'utf8',
    ),
  ) as BuildPageData;
  const expectedLinks = data.result.pageContext.relatedIds.map((id) => {
    const post = data.result.data.relatedPosts.edges.find(
      ({ node }) => node.id === id,
    )!.node;
    return `/${post.fields.langKey}${post.fields.slug}`;
  });
  expect(
    await page
      .locator('.related a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual(expectedLinks);
  const firstCover = page.locator('.related img').first();
  await expect(firstCover).toHaveAttribute('alt', '');
  await page.locator('.related').scrollIntoViewIfNeeded();
  await expectImageLoaded(firstCover, 200);
  await page.evaluate(() => {
    const top =
      document.querySelector('.related')!.getBoundingClientRect().top +
      window.scrollY;
    window.scrollTo(0, top - 100);
  });

  expect(await furtherReading.locator('a').count()).toBeGreaterThan(0);
  expect(
    await furtherReading.locator('a').first().getAttribute('href'),
  ).toMatch(/^\/en\//);
  await expect(furtherReading).toHaveAttribute(
    'aria-label',
    'Articles by publication date',
  );
  await expect(furtherReading).toContainText('Earlier article');
  const relatedLink = page.locator('.related a').first();
  await relatedLink.focus();
  await expect(relatedLink).toHaveCSS('outline-style', 'solid');
});

test('articles without curated recommendations do not show a related block', async ({
  page,
}) => {
  test.setTimeout(30_000);
  const response = await page.goto('/en/checkpointing_message_processing/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(200);
  await expect(page.locator('.related')).toHaveCount(0);
});

test('curated article links fit on a narrow screen', async ({ page }) => {
  test.setTimeout(30_000);
  await page.setViewportSize({
    width: 390,
    height: 844,
  });
  await page.goto('/en/vertical-slices-and-dependencies/', {
    waitUntil: 'domcontentloaded',
  });
  await page.locator('.related a').first().waitFor({
    state: 'visible',
  });
  await expectFonts(page);
  await expect(page.locator('.related h2')).toHaveCSS('font-weight', '600');
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(390);
  await expect(page.locator('.related a')).toHaveCount(2);
  await page.locator('.related img').last().scrollIntoViewIfNeeded();
  await page.locator('.related img').first().scrollIntoViewIfNeeded();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(
        document.querySelectorAll<HTMLImageElement>('.related img'),
        (image) => image.decode(),
      ),
    );
  });
  await page.evaluate(() => {
    const top =
      document.querySelector('.related')!.getBoundingClientRect().top +
      window.scrollY;
    window.scrollTo(0, top - 80);
  });
});

test('imported TypeScript examples display syntax colors', async ({ page }) => {
  await page.goto(
    '/en/keep-your-streams-short-temporal-modelling-for-fast-reads-and-optimal-data-retention/',
  );
  const keyword = page
    .locator('pre.language-typescript .token.keyword')
    .first();
  await keyword.waitFor({
    state: 'visible',
  });
  const colors = await keyword.evaluate((token) => ({
    keyword: getComputedStyle(token).color,
    code: getComputedStyle(token.closest('code')!).color,
  }));
  expect(colors.keyword).not.toBe(colors.code);
});

test('separate English and Polish pages keep their locale while following reciprocal article links', async ({
  page,
  otherPage,
}) => {
  const pages = [page, otherPage];
  const slug = 'open-source-a-relict-a-charity-or';
  await Promise.all(
    pages.map((page, index) =>
      page.goto(`/${index === 0 ? 'en' : 'pl'}/${slug}/`, {
        waitUntil: 'domcontentloaded',
      }),
    ),
  );
  for (const [index, page] of pages.entries()) {
    const language = index === 0 ? 'en' : 'pl';
    const other = language === 'en' ? 'pl' : 'en';
    const switcher = page.getByRole('link', {
      name: `Change language to ${other}`,
    });
    await switcher.waitFor({
      state: 'visible',
    });
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('.related h2')).toHaveText(
      language === 'en' ? 'Related articles' : 'Powiązane artykuły',
    );
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://event-driven.io/en/${slug}/`,
    );
    await expect(switcher).toHaveAttribute('href', `/${other}/${slug}/`);
    await page
      .locator(
        `.related a[href="/${language}/why-open-source-isnt-always-fair/"]`,
      )
      .click();
    await page.waitForURL(`**/${language}/why-open-source-isnt-always-fair/`);
    const returnLink = page.locator(`.related a[href="/${language}/${slug}/"]`);
    await returnLink.waitFor({
      state: 'visible',
    });
    await returnLink.click();
    await page.waitForURL(`**/${language}/${slug}/`);
    // The URL changes before Gatsby Head commits the next page's attributes.
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('.related h2')).toHaveText(
      language === 'en' ? 'Related articles' : 'Powiązane artykuły',
    );
    await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
      'href',
      `https://event-driven.io/en/${slug}/`,
    );
    await expect(page.locator('h1')).toHaveCount(1);
    await page
      .getByRole('link', {
        name: `Change language to ${other}`,
      })
      .click();
    await page.waitForURL(`**/${other}/${slug}/`);
    await expect(page.locator('.related h2')).toHaveText(
      other === 'pl' ? 'Powiązane artykuły' : 'Related articles',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', other);
    await expect(page.locator('footer.footer')).toHaveCount(1);
  }
});
