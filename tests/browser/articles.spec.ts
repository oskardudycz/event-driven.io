import { test, expect } from './fixtures';
import { expectFonts, expectImageLoaded } from './readiness';

test('article footer shows the author bio and links to further reading', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 1440,
    height: 900,
  });
  const response = await page.goto('/en/vertical-slices-and-dependencies/', {
    waitUntil: 'domcontentloaded',
  });
  expect(response?.status()).toBe(200);
  const author = page.locator('.author');
  await author.waitFor({
    state: 'visible',
  });
  await expectFonts(page);
  await expect(page.locator('.related h2')).toHaveCSS('font-weight', '600');
  await page.evaluate(() => document.fonts.ready);
  const bio = await author.locator('.note').innerText();
  expect(bio).toContain('Oskar Dudycz is an independent software architect');
  expect(bio).not.toContain('Through my window');
  expect(bio.length).toBeLessThan(500);
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
  expect(
    await page
      .locator('.related a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
  ).toEqual([
    '/en/how_to_slice_the_codebase_effectively/',
    '/en/vertical_slices_in_practice/',
  ]);
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
  await expect(page).toHaveScreenshot('article-related-desktop.png', {
    animations: 'disabled',
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
  await expect(author).toHaveScreenshot('article-footer-desktop.png', {
    animations: 'disabled',
  });
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
  await expect(page).toHaveScreenshot('article-related-mobile.png', {
    animations: 'disabled',
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
