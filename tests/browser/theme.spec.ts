import type { Page } from '@playwright/test';
import type { ThemePreference } from '../../src/theme/preference.ts';
import { test, expect } from './fixtures';

const themeLabels = {
  en: { light: 'Light', dark: 'Dark', system: 'System' },
  pl: { light: 'Jasny', dark: 'Ciemny', system: 'Systemowy' },
};
type Language = keyof typeof themeLabels;

function themeControl(page: Page, language: Language = 'en') {
  return page.getByLabel(language === 'pl' ? 'Motyw' : 'Theme', {
    exact: true,
  });
}

function themeChoice(
  page: Page,
  preference: ThemePreference,
  language: Language = 'en',
) {
  return page.getByLabel(themeLabels[language][preference], { exact: true });
}

async function chooseTheme(
  page: Page,
  preference: ThemePreference,
  language: Language = 'en',
) {
  await expect(themeControl(page, language)).toHaveAttribute(
    'aria-disabled',
    'false',
  );
  await themeControl(page, language).click();
  await themeChoice(page, preference, language).check();
}

test('shared video cards keep a responsive grid and readable themed borders', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/en/talks/');
  const grid = page.locator('.videoGrid');
  await expect(grid).toHaveCSS('display', 'grid');
  const columns = () =>
    grid.evaluate(
      (element) =>
        getComputedStyle(element).gridTemplateColumns.split(' ').length,
    );
  expect(await columns()).toBe(1);
  await expect(grid.locator('li').first()).toHaveCSS('border-top-width', '1px');
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect.poll(columns).toBe(2);
  await chooseTheme(page, 'dark');
  await expect(grid.locator('li').first()).toHaveCSS(
    'border-top-color',
    'rgb(56, 66, 74)',
  );
});

test('theme follows the system until explicitly selected and survives language navigation', async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/en/contact/');
  const picker = themeControl(page);
  await expect(picker).toHaveAttribute('aria-disabled', 'false');
  await expect(themeChoice(page, 'system')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(20, 24, 27)',
  );

  await chooseTheme(page, 'light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(themeChoice(page, 'light')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('link', { name: 'Change language to pl' }).click();
  await expect(page).toHaveURL(/\/pl\/contact\/$/);
  await expect(themeChoice(page, 'light', 'pl')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await chooseTheme(page, 'system', 'pl');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

test('saved dark theme applies before React loads and diagrams keep a readable canvas', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('color-theme', 'dark'));
  await page.route('**/*.js', (route) => route.abort());
  await page.goto('/en/introduction_to_event_sourcing/', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(20, 24, 27)',
  );
  await expect(page.locator('.gatsby-resp-image-image').first()).toHaveCSS(
    'background-color',
    'rgb(255, 255, 255)',
  );
  await expect(themeControl(page)).toHaveAttribute('aria-disabled', 'true');
  await expect(themeChoice(page, 'dark')).toBeDisabled();
});

test('theme selection works when preference storage is unavailable', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem.bind(localStorage);
    const setItem = Storage.prototype.setItem.bind(localStorage);
    Storage.prototype.getItem = function (key) {
      if (key === 'color-theme')
        throw new DOMException('Unavailable', 'SecurityError');
      return getItem(key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'color-theme')
        throw new DOMException('Unavailable', 'SecurityError');
      setItem(key, value);
    };
  });
  await page.goto('/en/contact/');
  const picker = themeControl(page);
  await expect(picker).toHaveAttribute('aria-disabled', 'false');
  await chooseTheme(page, 'dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  expect(errors).toEqual([]);
});

test('invalid stored preferences are ignored and theme controls fit on mobile', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.addInitScript(() =>
    localStorage.setItem('color-theme', '<script>invalid</script>'),
  );
  await page.goto('/pl/contact/');
  const picker = themeControl(page, 'pl');
  await expect(themeChoice(page, 'system', 'pl')).toBeChecked();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await picker.scrollIntoViewIfNeeded();
  await expect(picker).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});

for (const language of ['en', 'pl'] as const) {
  for (const width of [320, 390, 1280]) {
    test(`${language} header theme icon supports keyboard and dismissal at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${language}/contact/`);
      const control = themeControl(page, language);
      await expect(control).toHaveAttribute('aria-disabled', 'false');
      await expect(control).toBeInViewport();
      const header = page.getByRole('banner');
      await expect(
        header.getByLabel(language === 'pl' ? 'Motyw' : 'Theme', {
          exact: true,
        }),
      ).toBeVisible();
      const bounds = await control.boundingBox();
      const logo = await header.locator('a.logoType').boundingBox();
      expect(bounds && logo && bounds.x >= logo.x + logo.width).toBe(true);
      await control.focus();
      await page.keyboard.press('Enter');
      await expect(themeChoice(page, 'light', language)).toBeVisible();
      await page.keyboard.press('Tab');
      await expect(themeChoice(page, 'system', language)).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(themeChoice(page, 'light', language)).toBeHidden();
      await expect(control).toBeFocused();
      await control.click();
      // The open panel can cover the heading's center on narrow screens.
      await page.locator('h1').click({ position: { x: 5, y: 5 } });
      await expect(themeChoice(page, 'light', language)).toBeHidden();
      await chooseTheme(page, 'dark', language);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(themeChoice(page, 'light', language)).toBeHidden();
      await expect(control).toBeFocused();
    });
  }

  for (const width of [390, 1280]) {
    test(`${language} dark pages retain readable surfaces and fit at ${width}px`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(() =>
        localStorage.setItem('color-theme', 'dark'),
      );
      for (const route of [
        '',
        'articles/',
        'category/event-sourcing/',
        'introduction_to_event_sourcing/',
        'search/',
      ]) {
        await page.goto(`/${language}/${route}`);
        await expect(page.locator('html')).toHaveAttribute('lang', language);
        await expect(page.locator('html')).toHaveAttribute(
          'data-theme',
          'dark',
        );
        await expect(page.locator('body')).toHaveCSS(
          'background-color',
          'rgb(20, 24, 27)',
        );
        await expect(page.locator('body')).toHaveCSS(
          'color',
          'rgb(229, 231, 235)',
        );
        await expect(page.getByRole('contentinfo')).toHaveCSS(
          'background-color',
          'rgb(20, 24, 27)',
        );
        if (route === 'search/') {
          await page
            .getByPlaceholder(language === 'pl' ? 'Szukaj' : 'Search', {
              exact: true,
            })
            .fill('event sourcing');
          const result = page.locator('.search-hit').first();
          await expect(result).toBeVisible();
          await expect(result.locator('a').first()).toHaveCSS(
            'background-color',
            'rgb(20, 24, 27)',
          );
          await expect(result.locator('mark').first()).toHaveCSS(
            'color',
            'rgb(189, 220, 132)',
          );
        }
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth),
          route,
        ).toBeLessThanOrEqual(width);
      }
      expect(errors).toEqual([]);
    });
  }
}

test('theme preferences synchronize between tabs and reset to the system when cleared', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/en/contact/');
  const secondTab = await context.newPage();
  try {
    await secondTab.emulateMedia({ colorScheme: 'light' });
    await secondTab.goto('/pl/contact/');
    await chooseTheme(page, 'dark');
    await expect(themeChoice(secondTab, 'dark', 'pl')).toBeChecked();
    await expect(secondTab.locator('html')).toHaveAttribute(
      'data-theme',
      'dark',
    );
    await chooseTheme(secondTab, 'light', 'pl');
    await expect(themeChoice(page, 'light')).toBeChecked();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await secondTab.evaluate(() => localStorage.clear());
    await expect(themeChoice(page, 'system')).toBeChecked();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  } finally {
    await secondTab.close();
  }
});
