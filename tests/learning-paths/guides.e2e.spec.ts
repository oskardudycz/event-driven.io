import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { test, expect } from '../helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectImageLoaded,
} from '../helpers/browser/readiness.ts';
import {
  introParagraphs,
  plainQuotes,
  publishedGuides,
} from '../helpers/published-content.ts';

const guides = publishedGuides();
const labels: Record<string, { menu: string; next: string; box: string }> = {
  en: { menu: 'Guides', next: 'Next', box: 'Guides with this article' },
  pl: {
    menu: 'Przewodniki',
    next: 'Dalej',
    box: 'Przewodniki z tym artykułem',
  },
};
const articleRoute = (slug: string, language: string) =>
  existsSync(join('public', language, slug, 'index.html'))
    ? `/${language}/${slug}/`
    : `/en/${slug}/`;

for (const language of ['en', 'pl']) {
  const { menu: menuLabel, next: nextLabel, box } = labels[language]!;
  const localGuides = guides.filter((guide) => guide.language === language);

  for (const width of [390, 1280]) {
    test(`${language} menu at ${width}px leads to the guides`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${language}/articles/`, {
        waitUntil: 'domcontentloaded',
      });
      await expectFonts(page);
      const menu = page.getByRole('banner').getByRole('navigation');
      const expand = menu.getByRole('button', {
        name: /More links|Więcej linków/,
      });
      await expand.waitFor();
      if (width < 1024) await expand.click();
      const link = menu.locator('#navigation-links a[data-slug="/guides/"]');
      await expect(link).toBeVisible();
      await expect(link).toHaveText(menuLabel);
      await expect(link).toHaveAttribute('href', `/${language}/guides/`);
      await expect(menu.locator('a[data-slug="/category/"]')).toHaveCount(0);
      await link.click();
      await page.waitForURL(`**/${language}/guides/`);
      await expect(page.locator('main h1')).toHaveText(menuLabel);
    });
  }

  test(`${language} guide index shows every guide as a tile and opens a guide`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto(`/${language}/guides/`, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBe(200);
    await expectFonts(page);
    const tiles = page.locator('main li a');
    await expect(tiles).toHaveCount(localGuides.length);
    await expectImageLoaded(tiles.first().locator('img'));
    const first = localGuides[0]!;
    await expect(tiles.first().locator('h2')).toHaveText(
      `${first.metadata.icon} ${first.metadata.title}`,
    );
    const columns = await tiles.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().x),
    );
    expect(new Set(columns).size).toBe(2);
    await page.setViewportSize({ width: 390, height: 900 });
    await expect
      .poll(() =>
        tiles.evaluateAll(
          (elements) =>
            new Set(
              elements.map((element) => element.getBoundingClientRect().x),
            ).size,
        ),
      )
      .toBe(1);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    await tiles.nth(3).click();
    await page.waitForURL(`**${localGuides[3]!.route}`);
    await expect(page.locator('main h1')).toHaveText(
      `${localGuides[3]!.metadata.icon} ${localGuides[3]!.metadata.title}`,
    );
  });

  test(`${language} guide page shows its intro above the numbered articles`, async ({
    page,
  }) => {
    const guide = localGuides.find(({ slug }) => slug === 'cqrs')!;
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(guide.route, { waitUntil: 'domcontentloaded' });
    const paragraphs = page.locator('main .bodytext p');
    await expect(paragraphs).toHaveCount(introParagraphs(guide.body).length);
    expect((await paragraphs.allTextContents()).map(plainQuotes)).toEqual(
      introParagraphs(guide.body),
    );
    await expectFonts(page);
    await expect
      .poll(() =>
        page.evaluate(() => {
          const intro = document
            .querySelector('main .bodytext')!
            .getBoundingClientRect();
          const list = document
            .querySelector('main ol.ordered')!
            .getBoundingClientRect();
          return intro.bottom - list.top;
        }),
      )
      .toBeLessThanOrEqual(0);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      guide.metadata.description,
    );
  });

  test(`${language} guide page numbers its articles in the guide order`, async ({
    page,
  }) => {
    const guide = localGuides.find(({ slug }) => slug === 'cqrs')!;
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(guide.route, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('main')).toHaveCount(1);
    const steps = page.locator('main ol.ordered > li');
    await expect(steps).toHaveCount(guide.metadata.articles.length);
    expect(
      await steps
        .locator('a')
        .evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
    ).toEqual(
      guide.metadata.articles.map((slug) => articleRoute(slug, language)),
    );
    expect(
      await steps.evaluateAll((items) =>
        items.map((item) => getComputedStyle(item, '::before').display),
      ),
    ).toEqual(guide.metadata.articles.map(() => 'flex'));
  });

  test(`${language} article footer leads to the next article of its guide`, async ({
    page,
  }) => {
    const guide = localGuides.find(({ slug }) => slug === 'cqrs')!;
    const [current, next] = guide.metadata.articles;
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(articleRoute(current!, language), {
      waitUntil: 'domcontentloaded',
    });
    const footer = page.getByRole('complementary', { name: box });
    await expect(
      footer.getByRole('link', { name: guide.metadata.title, exact: true }),
    ).toHaveAttribute('href', guide.route);
    const nextLink = footer.getByRole('link', {
      name: new RegExp(`^${nextLabel}: `),
    });
    const nextTitle = (await nextLink.textContent())!.replace(
      `${nextLabel}: `,
      '',
    );
    await nextLink.click();
    const nextRoute = articleRoute(next!, language);
    await page.waitForURL(`**${nextRoute}`);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await expect(page.locator('main h1')).toHaveText(nextTitle);
    await expect(
      page
        .getByRole('complementary', { name: box })
        .getByRole('link', { name: guide.metadata.title, exact: true }),
    ).toHaveAttribute('href', guide.route);
  });
}

for (const theme of ['light', 'dark']) {
  test(`article guide box underlines its links in the ${theme} theme`, async ({
    page,
  }) => {
    await page.addInitScript(
      (value) => localStorage.setItem('color-theme', value),
      theme,
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/en/idempotent_command_handling/', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    const links = page
      .getByRole('complementary', { name: labels.en!.box })
      .getByRole('link');
    await expect(links).not.toHaveCount(0);
    expect(
      await links.evaluateAll((elements) =>
        elements.map((link) => getComputedStyle(link).textDecorationLine),
      ),
    ).toEqual(Array(await links.count()).fill('underline'));
  });
}

for (const [width, gap] of [
  [390, 20],
  [1280, 40],
]) {
  test(`article guide box keeps a ${gap}px gap to the share section at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: width!, height: 900 });
    await page.goto('/en/idempotent_command_handling/', {
      waitUntil: 'domcontentloaded',
    });
    const box = page.getByRole('complementary', { name: labels.en!.box });
    const share = page.locator('article footer .share');
    await expect(share).toBeVisible();
    const next = await box.evaluate((element) => ({
      className: element.nextElementSibling!.className,
      distance:
        element.nextElementSibling!.getBoundingClientRect().top -
        element.getBoundingClientRect().bottom,
    }));
    expect(next.className).toMatch(/\bshare\b/);
    expect(next.distance).toBe(gap);
  });
}
