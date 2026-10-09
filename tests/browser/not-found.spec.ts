import { test, expect } from './fixtures';

for (const javaScriptEnabled of [false, true]) {
  for (const language of ['en', 'pl']) {
    test.describe(`${language}, JavaScript ${javaScriptEnabled ? 'enabled' : 'disabled'}`, () => {
      test.use({
        javaScriptEnabled,
        viewport: {
          width: 390,
          height: 844,
        },
      });
      test('404 pages offer bilingual recovery with and without JavaScript', async ({
        page,
      }) => {
        await page.goto(`/${language}/404/`, {
          waitUntil: 'domcontentloaded',
        });
        const heading = page.locator('h1');
        await expect(heading).toHaveCount(1);
        await expect(heading).toContainText(
          language === 'pl' ? 'Ups!' : 'Oops!',
        );
        await expect(heading).toBeVisible();
        const recovery = page.locator('article nav');
        await expect(recovery.locator('a')).toHaveCount(3);
        await recovery.locator('a').first().click();
        await page.waitForURL(`**/${language}/`);
        await expect(page.locator('html')).toHaveAttribute('lang', language, {
          timeout: 10_000,
        });
        await expect(page.locator('h1')).toHaveCount(1);
      });
    });
  }
}

test.describe('root 404 without JavaScript', () => {
  test.use({
    javaScriptEnabled: false,
  });
  test('unknown URLs preserve their address and show the root fallback', async ({
    page,
  }) => {
    const response = await page.goto('/__missing_page__/', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(404);
    expect(new URL(page.url()).pathname).toBe('/__missing_page__/');
    await expect(page.locator('h1')).toContainText('Oops!');
  });
});

for (const language of ['en', 'pl']) {
  test(`${language} unknown URLs show localized recovery and preserve the missing address`, async ({
    page,
    baseURL,
  }) => {
    const response = await page.goto(`/${language}/__missing_page__/`, {
      waitUntil: 'domcontentloaded',
    });
    // Gatsby serve returns 200 for matchPath fallbacks. Netlify's explicit 404 rewrites
    // are also checked by test:404 against the generated deployment rules.
    const localGatsby = ['127.0.0.1', 'localhost'].includes(
      new URL(baseURL!).hostname,
    );
    expect(response?.status()).toBe(localGatsby ? 200 : 404);
    await expect(page.locator('h1')).toContainText(
      language === 'pl' ? 'Ups!' : 'Oops!',
      {
        timeout: 10_000,
      },
    );
    await expect(page.locator('html')).toHaveAttribute('lang', language, {
      timeout: 10_000,
    });
    expect(new URL(page.url()).pathname).toBe(`/${language}/__missing_page__/`);
    await page.locator('article nav a').nth(2).click();
    await page.waitForURL(`**/${language}/search/`);
    await expect(page.locator('h1')).toHaveCount(1);
  });
}
