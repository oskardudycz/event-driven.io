import type { Locator } from '@playwright/test';
import { test, expect } from './fixtures';
import { expectFonts, expectImageLoaded } from './readiness';

for (const deviceScaleFactor of [1, 2]) {
  test.describe(`covers at pixel ratio ${deviceScaleFactor}`, () => {
    test.use({
      deviceScaleFactor,
    });
    test('responsive covers match actual card widths across breakpoints and device pixel ratios', async ({
      page,
    }) => {
      for (const width of [390, 600, 768, 1024, 1440]) {
        await page.setViewportSize({
          width,
          height: 900,
        });
        await page.goto('/en/articles/');
        await expect(page.locator('html')).toHaveAttribute(
          'data-font400',
          'loaded',
        );
        const image = page.locator('img[data-main-image]').first();
        // Wait for the hydrated, visible lazy image rather than relying on
        // load timing while the CI runner is also checking the built output.
        await image.scrollIntoViewIfNeeded();
        await expectImageLoaded(image);
        const result = await image.evaluate((e: HTMLImageElement) => {
          const picture = e.closest('picture')!;
          const sizes = picture.querySelector('source')!.sizes || e.sizes;
          const slots = sizes.split(',').map((s) => s.trim());
          let slot;
          for (const candidate of slots) {
            const conditional = candidate.match(/^(\([^)]*\)) (.+)$/);
            if (!conditional?.[1] || matchMedia(conditional[1]).matches) {
              slot = conditional ? conditional[2] : candidate;
              break;
            }
          }
          const probe = document.createElement('div');
          probe.style.cssText = `position:absolute;width:${slot};height:0`;
          document.body.append(probe);
          const declared = probe.getBoundingClientRect().width;
          probe.remove();
          return {
            declared,
            actual: e.getBoundingClientRect().width,
            src: e.currentSrc,
          };
        });
        expect(Math.abs(result.declared - result.actual)).toBeLessThanOrEqual(
          2,
        );
        expect(result.src).toContain('.webp');
      }
    });
  });
}

test('Polish diacritics use the web Open Sans face across weights and italics', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844,
  });
  await page.goto('/pl/training/', {
    waitUntil: 'domcontentloaded',
  });
  await expectFonts(page);
  await page.evaluate(async () => {
    for (const weight of [300, 400, 600, 700, 800]) {
      for (const style of ['normal', 'italic']) {
        const probe = document.createElement('span');
        probe.id = `polish-font-${weight}-${style}`;
        probe.style.cssText = `display:block;font: ${style} ${weight} 24px "Open Sans", sans-serif`;
        probe.textContent = 'ĄĆĘŁŃÓŚŹŻ ąćęłńóśźż';
        document.body.append(probe);
        await document.fonts.load(
          `${style} ${weight} 24px "Open Sans"`,
          probe.textContent,
        );
      }
    }
    await document.fonts.ready;
  });
  const session = await page.context().newCDPSession(page);
  await session.send('DOM.enable');
  await session.send('CSS.enable');
  const { root } = await session.send('DOM.getDocument');
  for (const weight of [300, 400, 600, 700, 800]) {
    for (const style of ['normal', 'italic']) {
      const { nodeId } = await session.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: `#polish-font-${weight}-${style}`,
      });
      const { fonts } = await session.send('CSS.getPlatformFontsForNode', {
        nodeId,
      });
      expect(fonts.length, `${weight} ${style}`).toBeGreaterThan(0);
      for (const font of fonts) {
        expect(
          font.familyName,
          `${weight} ${style}: ${font.glyphCount} glyphs`,
        ).toMatch(/^Open Sans/);
        expect(
          font.isCustomFont,
          `${weight} ${style}: ${font.familyName}`,
        ).toBe(true);
      }
    }
  }
});

test('approved text colors maintain contrast on actual white surfaces and interaction states', async ({
  page,
}) => {
  await page.goto('/en/introduction_to_event_sourcing/', {
    waitUntil: 'domcontentloaded',
  });
  const link = page.locator('.bodytext p a').first();
  await link.scrollIntoViewIfNeeded();
  const colors = async (locator: Locator) =>
    locator.evaluate((node) => {
      let background: Element | null = node;
      while (
        background &&
        getComputedStyle(background).backgroundColor === 'rgba(0, 0, 0, 0)'
      )
        background = background.parentElement;
      return {
        color: getComputedStyle(node).color,
        background: background
          ? getComputedStyle(background).backgroundColor
          : 'rgb(255, 255, 255)',
      };
    });
  const expected = {
    color: 'rgb(85, 112, 28)',
    background: 'rgb(255, 255, 255)',
  };
  expect(await colors(link)).toEqual(expected);
  await link.hover();
  expect(await colors(link)).toEqual(expected);
  await link.focus();
  expect(await colors(link)).toEqual(expected);
  expect(await colors(page.locator('footer li').first())).toEqual({
    color: 'rgb(112, 110, 107)',
    background: 'rgb(255, 255, 255)',
  });
});

for (const [language, javaScriptEnabled] of [
  ['en', true],
  ['pl', true],
  ['en', false],
  ['pl', false],
] as const) {
  test.describe(`${language}, JavaScript ${javaScriptEnabled ? 'enabled' : 'disabled'}`, () => {
    test.use({
      javaScriptEnabled,
      viewport: {
        width: 1023,
        height: 900,
      },
    });
    test('CSS Module summaries and site footers preserve styles and respond to theme variables', async ({
      page,
    }) => {
      await page.goto(`/${language}/introduction_to_event_sourcing/`, {
        waitUntil: 'domcontentloaded',
      });
      const summary = page.locator('.standfirst');
      const footer = page.locator('footer.footer');
      if (language === 'en') await summary.waitFor();
      else await expect(summary).toHaveCount(0);
      const values = (element: Element) => {
        const style = getComputedStyle(element);
        return {
          color: style.color,
          background: style.backgroundColor,
          size: style.fontSize,
          lineHeight: style.lineHeight,
          bottom: style.marginBottom,
          padding: style.paddingBottom,
        };
      };
      if (language === 'en')
        expect(await summary.evaluate(values)).toMatchObject({
          color: 'rgb(62, 62, 60)',
          size: '21.6px',
          lineHeight: '30.24px',
          bottom: '40px',
        });
      expect(await footer.evaluate(values)).toMatchObject({
        background: 'rgb(255, 255, 255)',
        padding: '120px',
      });
      expect(await footer.locator('li').first().evaluate(values)).toMatchObject(
        {
          color: 'rgb(112, 110, 107)',
          size: '12.8px',
        },
      );
      await page.setViewportSize({
        width: 1024,
        height: 900,
      });
      await expect
        .poll(() => footer.evaluate(values))
        .toMatchObject({
          padding: '24px',
        });
      await page.evaluate(() => {
        document.documentElement.style.setProperty('--color-text', '#123456');
        document.documentElement.style.setProperty(
          '--color-surface',
          '#234567',
        );
      });
      if (language === 'en')
        expect(await summary.evaluate(values)).toMatchObject({
          color: 'rgb(18, 52, 86)',
        });
      expect(await footer.evaluate(values)).toMatchObject({
        background: 'rgb(35, 69, 103)',
      });
      await expect(footer).toHaveCount(1);
    });
  });
}

for (const language of ['en', 'pl']) {
  for (const javaScriptEnabled of [true, false]) {
    test.describe(`${language}, JavaScript ${javaScriptEnabled ? 'enabled' : 'disabled'}`, () => {
      test.use({
        javaScriptEnabled,
        viewport: {
          width: 599,
          height: 900,
        },
      });
      test('reading CSS Modules preserve bilingual server styles, responsive cards and navigation', async ({
        page,
      }) => {
        await page.goto(`/${language}/open-source-a-relict-a-charity-or/`, {
          waitUntil: 'domcontentloaded',
        });
        const related = page.locator('.related');
        const navigation = page.locator('article footer nav.links');
        const grid = related.locator('.withImages');
        const style = (element: Element) => {
          const css = getComputedStyle(element);
          return {
            marginTop: css.marginTop,
            marginBottom: css.marginBottom,
            paddingBottom: css.paddingBottom,
            direction: css.flexDirection,
            border: css.borderBottomColor,
            columns: css.gridTemplateColumns.split(' ').length,
            color: css.color,
          };
        };
        expect(await related.evaluate(style)).toMatchObject({
          marginTop: '20px',
          marginBottom: '40px',
        });
        expect(await navigation.evaluate(style)).toMatchObject({
          direction: 'column',
          paddingBottom: '40px',
          border: 'rgb(236, 235, 234)',
        });
        expect(await navigation.locator('a').count()).toBeGreaterThan(0);
        await expect(navigation.locator('svg').first()).toHaveCSS(
          'fill',
          'rgb(255, 165, 0)',
        );
        expect(await grid.evaluate(style)).toMatchObject({
          columns: 1,
        });
        await page.setViewportSize({
          width: 600,
          height: 900,
        });
        await expect
          .poll(() => grid.evaluate(style))
          .toMatchObject({
            columns: 2,
          });
        await page.setViewportSize({
          width: 1024,
          height: 900,
        });
        await expect
          .poll(() => navigation.evaluate(style))
          .toMatchObject({
            direction: 'row-reverse',
          });
        const card = related.locator('a.readingCard').first();
        await card.focus();
        await expect(card).toHaveCSS('outline-style', 'solid');
        await page.evaluate(() =>
          document.documentElement.style.setProperty(
            '--color-border',
            '#123456',
          ),
        );
        expect(await navigation.evaluate(style)).toMatchObject({
          border: 'rgb(18, 52, 86)',
        });
        await page.emulateMedia({
          reducedMotion: 'reduce',
        });
        await card.hover();
        await expect(card).toHaveCSS('transition-duration', '0s');
        await expect(card).toHaveCSS('transform', 'none');
        await navigation.locator('a').first().hover();
        await expect(navigation.locator('svg').first()).toHaveCSS(
          'transform',
          'none',
        );
        await page.goto(`/${language}/category/event-sourcing/`, {
          waitUntil: 'domcontentloaded',
        });
        const ordered = page.locator('ol.ordered');
        await expect(ordered).toHaveCount(1);
        await expect(ordered.locator('li').first()).toHaveCSS(
          'counter-increment',
          /reading-order/,
        );
        await expect
          .poll(() =>
            ordered
              .locator('li')
              .first()
              .evaluate(
                (element) =>
                  getComputedStyle(element, '::before').backgroundColor,
              ),
          )
          .toBe('rgb(112, 148, 37)');
      });
    });
  }
}

test('layout loads fonts silently and navigation dates have readable contrast', async ({
  page,
}) => {
  const messages: string[] = [];
  page.on('console', (message) => messages.push(message.text()));
  await page.goto(`/en/open-source-a-relict-a-charity-or/`, {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('h1')).toHaveCSS('font-weight', '600');
  await expect(page.locator('body')).toHaveCSS('font-family', /Open Sans/);
  expect(
    messages.filter((message) =>
      /font(?:400|600) is (?:not )?available/.test(message),
    ),
  ).toEqual([]);
  const dates = await page.locator('nav.links time').all();
  expect(dates.length).toBeGreaterThan(0);
  for (const date of dates) {
    const contrast = await date.evaluate((element) => {
      const channels = getComputedStyle(element)
        .color.match(/\d+/g)!
        .slice(0, 3)
        .map(Number);
      const linear = channels.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045
          ? value / 12.92
          : ((value + 0.055) / 1.055) ** 2.4;
      });
      const [red, green, blue] = linear;
      if (red === undefined || green === undefined || blue === undefined)
        throw new Error('Expected three RGB channels');
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      // Current article/navigation surface is white.
      return 1.05 / (luminance + 0.05);
    });
    expect(contrast).toBeGreaterThanOrEqual(4.5);
  }
});

for (const language of ['en', 'pl']) {
  for (const javaScriptEnabled of [false, true]) {
    test.describe(`${language}, JavaScript ${javaScriptEnabled ? 'enabled' : 'disabled'}`, () => {
      test.use({
        javaScriptEnabled,
        viewport: {
          width: 390,
          height: 844,
        },
      });
      test('native article and hero styles work before hydration and across breakpoints', async ({
        page,
      }) => {
        await page.goto(`/${language}/introduction_to_event_sourcing/`, {
          waitUntil: 'domcontentloaded',
        });
        if (javaScriptEnabled) {
          await expect(page.locator('body')).toHaveCSS(
            'font-family',
            /Open Sans/,
          );
        } else {
          await expect(page.locator('body')).toHaveCSS('font-family', /Arial/);
        }
        const article = page.locator('main > article');
        const dimensions = () =>
          article.evaluate((el) => {
            const css = getComputedStyle(el);
            return {
              top: css.paddingTop,
              left: css.paddingLeft,
              maxWidth: css.maxWidth,
            };
          });
        expect(await dimensions()).toMatchObject({
          top: '20px',
          left: '20px',
        });
        const paragraph = page.locator('.bodytext > p').first();
        await expect(paragraph).toHaveCSS('font-size', '17.6px');
        await page.setViewportSize({
          width: 600,
          height: 900,
        });
        await expect.poll(dimensions).toMatchObject({
          top: '20px',
          left: '40px',
          maxWidth: '650px',
        });
        await page.setViewportSize({
          width: 1024,
          height: 900,
        });
        await expect.poll(dimensions).toMatchObject({
          top: '130px',
          left: '0px',
          maxWidth: '850px',
        });
        await page.goto(`/${language}/`, {
          waitUntil: 'domcontentloaded',
        });
        const hero = page.locator('.hero');
        const backgrounds = new Set();
        for (const width of [390, 600, 1024]) {
          await page.setViewportSize({
            width,
            height: 900,
          });
          const image = await hero.evaluate(
            (el) => getComputedStyle(el).backgroundImage,
          );
          expect(image).toMatch(/^url\(/);
          backgrounds.add(image);
        }
        expect(backgrounds.size).toBe(3);
        await expect(hero.locator('h1')).toHaveCount(1);
        await expect(hero.locator('h1 > u')).toHaveCount(1);
        await expect(hero.locator('h2 > span.yellow')).toHaveCount(1);
      });
    });
  }
}
