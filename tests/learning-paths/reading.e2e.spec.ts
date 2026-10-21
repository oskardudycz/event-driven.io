import { test, expect } from '../helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectImageLoaded,
} from '../helpers/browser/readiness.ts';
import {
  publishedGuides,
  publishedContent,
} from '../helpers/published-content.ts';

const guides = publishedGuides().filter(
  ({ slug }) => slug === 'event-sourcing-foundations',
);

const articles = publishedContent('posts');
for (const guide of guides) {
  const articleIndex = guide.metadata.articles.findIndex((slug) =>
    articles.some(
      (article) =>
        article.route === `/${guide.language}/${slug}/` &&
        /^#{2,6} /m.test(article.body),
    ),
  );
  for (const width of [390, 1280]) {
    test(`${guide.language} guide reading flow preserves appearance and language at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto(guide.route);
      await expectFonts(page);
      await expect(page.locator('header fieldset')).toBeEnabled();
      const cards = page.locator('main ol.ordered > li');
      await expect(cards).toHaveCount(guide.metadata.articles.length);
      await expectImageLoaded(cards.first().locator('img'), 200);
      expect(articleIndex).toBeGreaterThanOrEqual(0);
      const card = cards.nth(articleIndex);
      const title = await card.locator('h3').innerText();
      await card.getByRole('link').click();
      await expect(page.locator('main h1')).toHaveText(title);
      await expectFonts(page);
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        guide.language,
      );
      const appearance = page.locator('nav details');
      await appearance.locator('summary').click();
      await appearance.locator('input[value="dark"]').check();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await page.keyboard.press('Escape');
      const permalink = page.locator('main a.anchor').first();
      const fragment = await permalink.getAttribute('href');
      expect(fragment).toMatch(/^#.+/);
      await permalink.focus();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(
        new RegExp(`${fragment!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`),
      );
      const language = guide.language === 'en' ? 'pl' : 'en';
      await page.locator(`nav a[hreflang="${language}"]`).click();
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expectFonts(page);
      await expect(page.locator('nav input[value="dark"]')).toBeChecked();
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expectFonts(page);
      await expect(page.locator('nav input[value="dark"]')).toBeChecked();
      const translatedGuide = guides.find(
        (candidate) => candidate.language === language,
      )!;
      const guideLink = page.locator('.guideSteps').getByRole('link', {
        name: translatedGuide.metadata.title,
        exact: true,
      });
      await guideLink.click();
      await expect(page).toHaveURL(
        new RegExp(`/${language}/guides/${guide.slug}/$`),
      );
      await expect(page.locator('main ol.ordered > li')).toHaveCount(
        guide.metadata.articles.length,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
    });
  }

  test.describe(`${guide.language} server rendering`, () => {
    test.use({ javaScriptEnabled: false });
    test('guide and article remain readable without JavaScript', async ({
      page,
    }) => {
      await page.goto(guide.route);
      await expect(page.locator('main h1')).toContainText(guide.metadata.title);
      await expect(page.locator('main ol.ordered > li')).toHaveCount(
        guide.metadata.articles.length,
      );
      await page.locator('main ol.ordered a').nth(articleIndex).click();
      await expect(page.locator('main .bodytext')).not.toBeEmpty();
      await expect(page.locator('main a.anchor').first()).toHaveAttribute(
        'href',
        /^#/,
      );
      await expect(page.locator('.guideSteps')).toContainText(
        guide.metadata.title,
      );
      const destination = guide.language === 'en' ? 'pl' : 'en';
      await expect(
        page.locator(`nav a[hreflang="${destination}"]`),
      ).toHaveCount(1);
    });
  });
}
