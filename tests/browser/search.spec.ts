import { test, expect } from './fixtures';
import { expectFonts, expectImageLoaded } from './readiness';

for (const language of ['en', 'pl']) {
  test(`${language} searches local content with lazy indexes, fallback links and pagination`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 390,
      height: 844,
    });
    const indexRequests: string[] = [];
    const engineRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/local-search-engine-'))
        engineRequests.push(request.url());
      if (request.url().includes('/search-index/'))
        indexRequests.push(request.url());
    });
    await page.goto(`/${language}/articles/`, {
      waitUntil: 'domcontentloaded',
    });
    expect(indexRequests).toHaveLength(0);
    expect(engineRequests).toHaveLength(0);
    await page.goto(`/${language}/search/`, {
      waitUntil: 'domcontentloaded',
    });
    const input = page.getByPlaceholder(
      language === 'pl' ? 'Szukaj' : 'Search',
      {
        exact: true,
      },
    );
    await input.waitFor();
    await expectFonts(page);
    await expect(page.locator('h1')).toHaveCount(1);
    expect(indexRequests).toHaveLength(0);
    expect(engineRequests).toHaveLength(0);
    await expect(page.locator('.search-message')).toHaveText(
      language === 'pl'
        ? 'Wpisz wyszukiwaną frazę.'
        : 'Start typing to search.',
    );
    await input.fill('introduction event sourcing');
    const result = page.locator('.search-hit').filter({
      has: page.locator(
        `a[href="/${language}/introduction_to_event_sourcing/"]`,
      ),
    });
    await result.waitFor();
    await expect(result.locator('h2')).toContainText(
      'Introduction to Event Sourcing',
    );
    expect(await result.locator('mark').count()).toBeGreaterThan(0);
    const cover = result.locator('.search-hit-cover img[data-main-image]');
    await cover.waitFor({
      state: 'visible',
    });
    await expectImageLoaded(cover);
    await expect(cover).toHaveAttribute('alt', '');
    await expect(cover).toHaveAttribute(
      'sizes',
      '(max-width: 599px) 88px, 180px',
    );
    const colors = await result
      .locator('mark')
      .first()
      .evaluate((mark) => ({
        color: getComputedStyle(mark).color,
        background: getComputedStyle(mark).backgroundColor,
      }));
    expect(colors.color).toBe('rgb(85, 112, 28)');
    expect(colors.background).toBe('rgba(112, 148, 37, 0.094)');
    await result.locator('a').hover();
    await expect(result.locator('h2')).toHaveCSS('color', 'rgb(85, 112, 28)');
    expect(
      await result
        .locator('.search-hit-cover')
        .evaluate((element) =>
          Math.round(element.getBoundingClientRect().width),
        ),
    ).toBe(88);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (language === 'en')
      await expect(result).toHaveScreenshot('search-card-en-mobile.png', {
        animations: 'disabled',
      });
    await result.locator('a').focus();
    await expect(result.locator('a')).toHaveCSS('outline-style', 'solid');
    await page.setViewportSize({
      width: 1440,
      height: 1000,
    });
    expect(
      await result
        .locator('.search-hit-cover')
        .evaluate((element) =>
          Math.round(element.getBoundingClientRect().width),
        ),
    ).toBe(180);
    if (language === 'en')
      await expect(result).toHaveScreenshot('search-card-en-desktop.png', {
        animations: 'disabled',
      });
    await page.setViewportSize({
      width: 390,
      height: 844,
    });
    await expect(result.locator('.search-hit-meta')).toContainText(
      '2022-03-16',
    );
    if (language === 'pl')
      await expect(result.locator('.search-hit-meta')).toContainText(
        'PO ANGIELSKU',
        {
          useInnerText: true,
        },
      );
    expect(indexRequests).toHaveLength(2);
    expect(engineRequests).toHaveLength(1);
    expect(indexRequests[1]).toMatch(
      new RegExp(`/search-index/${language}\\.[a-f0-9]+\\.json`),
    );
    await input.fill('event sourcing');
    await expect(page.locator('.search-hit')).toHaveCount(10);
    const first = await page
      .locator('.search-hit a')
      .first()
      .getAttribute('href');
    await page
      .getByRole('button', {
        name: language === 'pl' ? 'Następna' : 'Next',
        exact: true,
      })
      .click();
    await expect(page.locator('.search-hit a').first()).not.toHaveAttribute(
      'href',
      first!,
    );
    await input.fill('zzzznotarealwordxyz');
    await expect(page.locator('.search-message')).toHaveText(
      language === 'pl'
        ? 'Nie znaleziono pasujących wyników.'
        : 'No matching results found.',
    );
    await input.fill('appendToStream');
    await expect
      .poll(() => page.locator('.search-hit').count())
      .toBeGreaterThan(0);
    await page
      .getByRole('button', {
        name: language === 'pl' ? 'Wyczyść' : 'Clear',
      })
      .click();
    await expect(input).toHaveValue('');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test('local search reports load failures and retries successfully', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/search-index/manifest.json', async (route) => {
    requests++;
    if (requests === 1)
      await route.fulfill({
        status: 503,
        body: 'Unavailable',
      });
    else await route.continue();
  });
  await page.goto('/en/search/', {
    waitUntil: 'domcontentloaded',
  });
  await expectFonts(page);
  await page
    .getByPlaceholder('Search', {
      exact: true,
    })
    .fill('event sourcing');
  await page
    .getByRole('button', {
      name: 'Try again',
      exact: true,
    })
    .waitFor();
  await page
    .getByRole('button', {
      name: 'Try again',
      exact: true,
    })
    .click();
  await page.locator('.search-hit').first().waitFor();
  expect(requests).toBe(2);
});
