import { test, expect } from './fixtures';

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
  await page.getByLabel('Theme', { exact: true }).selectOption('dark');
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
  const picker = page.getByLabel('Theme', { exact: true });
  await expect(picker).toBeEnabled();
  await expect(picker).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('body')).toHaveCSS(
    'background-color',
    'rgb(20, 24, 27)',
  );

  await picker.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(picker).toHaveValue('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.getByRole('link', { name: 'Change language to pl' }).click();
  await expect(page).toHaveURL(/\/pl\/contact\/$/);
  await expect(page.getByLabel('Motyw', { exact: true })).toHaveValue('light');
  await expect(page.locator('html')).toHaveAttribute('lang', 'pl');
  await page.getByLabel('Motyw', { exact: true }).selectOption('system');
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
  await expect(page.getByLabel('Theme', { exact: true })).toBeDisabled();
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
  const picker = page.getByLabel('Theme', { exact: true });
  await expect(picker).toBeEnabled();
  await picker.selectOption('dark');
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
  const picker = page.getByLabel('Motyw', { exact: true });
  await expect(picker).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await picker.scrollIntoViewIfNeeded();
  await expect(picker).toBeInViewport();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth),
  ).toBeLessThanOrEqual(390);
});
