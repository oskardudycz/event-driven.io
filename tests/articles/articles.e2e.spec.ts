import { existsSync, readFileSync, readdirSync } from 'node:fs';
import type { BuildPageData } from '../helpers/build-output.ts';
import { test, expect } from '../helpers/browser/fixtures.ts';
import {
  expectFonts,
  expectImageLoaded,
} from '../helpers/browser/readiness.ts';
import { tagSlug } from '../../src/utils/tag-slug.ts';
import {
  introParagraphs,
  plainQuotes,
  publishedTagFile,
} from '../helpers/published-content.ts';

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
    page.locator('article footer > .substack + .guideSteps + .related'),
  ).toHaveCount(1);
  const spacing = await page.evaluate(() => {
    const iframe = document.querySelector('.substack iframe')!;
    const guides = document.querySelector('.guideSteps')!;
    const related = document.querySelector('.related')!;
    return {
      gaps: [
        guides.getBoundingClientRect().top -
          iframe.getBoundingClientRect().bottom,
        related.getBoundingClientRect().top -
          guides.getBoundingClientRect().bottom,
      ],
      border: getComputedStyle(related).borderTopWidth,
    };
  });
  expect(spacing.border).toBe('0px');
  for (const gap of spacing.gaps) {
    expect(gap).toBeGreaterThanOrEqual(0);
    expect(gap).toBeLessThanOrEqual(30);
  }
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

function polishArticleWithTranslatedTag() {
  const translation = JSON.parse(
    readFileSync('src/i18n/locales/pl/translation.json', 'utf8'),
  ) as { tags: { labels: Record<string, string> } };
  const labels = Object.entries(translation.tags.labels);
  for (const entry of readdirSync('public/page-data/pl', {
    withFileTypes: true,
  })) {
    const file = `public/page-data/pl/${entry.name}/page-data.json`;
    if (!entry.isDirectory() || !existsSync(file)) continue;
    const { path, result } = JSON.parse(
      readFileSync(file, 'utf8'),
    ) as BuildPageData;
    const tags = result.data.post?.frontmatter.tags || [];
    const translated = labels.find(([slug]) =>
      tags.some((tag) => tagSlug(tag) === slug),
    );
    if (translated) return { path, slug: translated[0], label: translated[1] };
  }
  throw new Error('Expected a Polish article with a translated tag');
}

test('tag labels follow the interface language and link to the tag page of that language', async ({
  page,
}) => {
  const { path, slug, label } = polishArticleWithTranslatedTag();
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(
    page.locator(`header .meta a[href="/pl/articles/tag/${slug}/"]`),
  ).toHaveText(label);
  await page.getByRole('link', { name: 'Change language to en' }).click();
  const englishPath = path.replace(/^\/pl\//, '/en/');
  await page.waitForURL(`**${englishPath}`);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const englishTag = page.locator(
    `header .meta a[href="/en/articles/tag/${slug}/"]`,
  );
  await expect(englishTag).toBeVisible();
  await expect(englishTag).not.toHaveText(label);
});

for (const language of ['en', 'pl']) {
  for (const width of [390, 1280]) {
    test(`${language} article tag opens its tag page at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${language}/introduction_to_event_sourcing/`, {
        waitUntil: 'domcontentloaded',
      });
      const tag = page
        .locator('header .meta')
        .getByRole('link', { name: 'Event Sourcing', exact: true });
      await expect(tag).toBeVisible();
      await tag.click();
      await page.waitForURL(`**/${language}/articles/tag/event-sourcing/`);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(
        page.getByRole('heading', { level: 1, name: 'Event Sourcing' }),
      ).toBeVisible();
      await expect(
        page.locator(
          `li > a.link[href="/${language}/introduction_to_event_sourcing/"]`,
        ),
      ).toHaveCount(1);
    });
  }
}

for (const language of ['en', 'pl']) {
  test(`${language} tag page shows its intro and uses its own description`, async ({
    page,
  }) => {
    const tagFile = publishedTagFile('event-sourcing', language)!;
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(`/${language}/articles/tag/event-sourcing/`, {
      waitUntil: 'domcontentloaded',
    });
    const paragraphs = page.locator('main .bodytext p');
    await expect(paragraphs).toHaveCount(introParagraphs(tagFile.body).length);
    expect((await paragraphs.allTextContents()).map(plainQuotes)).toEqual(
      introParagraphs(tagFile.body),
    );
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      'content',
      tagFile.description,
    );
  });
}

const metaLabels: Record<string, { tags: string; guides: string }> = {
  en: { tags: 'Tags:', guides: 'Guides:' },
  pl: { tags: 'Tagi:', guides: 'Przewodniki:' },
};

for (const language of ['en', 'pl']) {
  for (const width of [390, 1440]) {
    test(`${language} article header lists its tags and guides with links to existing pages at ${width}px`, async ({
      page,
    }) => {
      const route = `/${language}/idempotent_command_handling/`;
      const { pageContext } = (
        JSON.parse(
          readFileSync(`public/page-data${route}page-data.json`, 'utf8'),
        ) as BuildPageData
      ).result;
      const tagLinks = (pageContext.tagLinks || []).filter(({ path }) => path);
      const guides = pageContext.guides || [];
      expect(guides.length).toBeGreaterThan(0);
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      const header = page.locator('article header');
      const tags = header.getByRole('group', {
        name: metaLabels[language]!.tags,
      });
      const guideGroup = header.getByRole('group', {
        name: metaLabels[language]!.guides,
      });
      const label = tags.getByText(metaLabels[language]!.tags, {
        exact: true,
      });
      await expect(label).toHaveCSS('font-weight', '600');
      await expect(label).toHaveCSS(
        'color',
        await page
          .locator('body')
          .evaluate((body) => getComputedStyle(body).color),
      );
      await expect(tags.getByRole('link')).toHaveCount(tagLinks.length);
      await expect(guideGroup.getByRole('link')).toHaveText(
        guides.map(({ title, step, total }) => `${title} (${step}/${total})`),
      );
      const destinations = [
        ...tagLinks.map(({ path }) => path!),
        ...guides.map(({ path }) => path),
      ];
      expect(
        await header
          .getByRole('group')
          .getByRole('link')
          .evaluateAll((links) =>
            links.map((link) => link.getAttribute('href')),
          ),
      ).toEqual(destinations);
      for (const destination of destinations) {
        const response = await page.request.get(destination, {
          maxRedirects: 0,
        });
        expect(response.status(), destination).toBe(200);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBeLessThanOrEqual(width);
      await guideGroup.getByRole('link').first().click();
      await page.waitForURL(`**${guides[0]!.path}`);
      await expect(page.locator('html')).toHaveAttribute('lang', language);
      await expect(page.locator('main h1')).toContainText(guides[0]!.title);
    });
  }
}
