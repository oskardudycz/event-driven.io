import { test, expect } from '../../../tests/helpers/browser/fixtures.ts';

for (const language of ['en', 'pl']) {
  test(`${language} article sharing controls load and remain usable`, async ({
    page,
  }) => {
    await page.goto(`/${language}/vertical-slices-and-dependencies/`, {
      waitUntil: 'domcontentloaded',
    });
    for (const name of ['X share', 'Facebook share', 'LinkedIn share']) {
      const button = page.getByRole('button', { name, exact: true });
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
    }
  });
}
