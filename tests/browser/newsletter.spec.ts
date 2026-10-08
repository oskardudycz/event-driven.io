declare global {
  interface Window {
    newsletterObservers: (IntersectionObserver & { disconnected?: boolean })[];
  }
}

import { test, expect } from './fixtures';
import { expectFonts } from './readiness';

test('Introduction newsletter defers its request and loads automatically on scroll', async ({
  page,
}) => {
  await page.setViewportSize({
    width: 390,
    height: 844,
  });
  const requests: string[] = [];
  let pendingRequestStarted = false;
  const { promise: pendingRequest, resolve: releasePendingRequest } = Promise.withResolvers<void>();
  let pendingRequestFinished: Promise<void> | undefined;
  try {
    // Keep a request open to reproduce the CI failure: readiness must not
    // depend on analytics/comments or any other network activity stopping.
    await page.route('**/__visual_pending_request__', async (route) => {
      pendingRequestStarted = true;
      pendingRequestFinished = pendingRequest.then(() =>
        route.fulfill({
          body: 'ready',
        }),
      );
      await pendingRequestFinished;
    });
    await page.addInitScript(() => {
      if (window !== window.top) return;
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          fetch('/__visual_pending_request__').catch(() => {});
        },
        {
          once: true,
        },
      );
    });
    await page.route('https://www.architecture-weekly.com/embed', async (route) => {
      requests.push(route.request().url());
      await route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><body>Newsletter form</body></html>',
      });
    });
    await page.goto('/en/introduction_to_event_sourcing/', {
      waitUntil: 'domcontentloaded',
    });
    await expectFonts(page);
    await expect.poll(() => pendingRequestStarted).toBe(true);
    const iframe = page.locator('#substack iframe');
    await iframe.waitFor({
      state: 'attached',
    });
    await expect(iframe).toHaveAttribute('loading', 'lazy');
    await expect(iframe).toHaveAttribute('title', 'Subscribe to Architecture Weekly');
    expect(requests).toHaveLength(0);
    await iframe.scrollIntoViewIfNeeded();
    await expect.poll(() => requests.length).toBe(1);
    await expect(page.frameLocator('#substack iframe').locator('body')).toHaveText(
      'Newsletter form',
    );
  } finally {
    releasePendingRequest();
    await pendingRequestFinished;
  }
});

for (const lang of ['en', 'pl']) {
  test(`${lang} desktop newsletter waits for viewport and keeps its reserved height`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: 1440,
      height: 900,
    });
    const requests: string[] = [];
    await page.route('https://www.architecture-weekly.com/embed', async (route) => {
      requests.push(route.request().url());
      await route.fulfill({
        contentType: 'text/html',
        body: '<p>Newsletter form</p>',
      });
    });
    await page.goto(`/${lang}/introduction_to_event_sourcing/`, {
      waitUntil: 'domcontentloaded',
    });
    await expectFonts(page);
    const iframe = page.locator('#substack iframe');
    await expect(iframe).not.toHaveAttribute('src');
    expect(requests).toHaveLength(0);
    const before = await iframe.boundingBox();
    expect(before!.height).toBe(320);
    await page.locator('#substack').scrollIntoViewIfNeeded();
    await expect.poll(() => requests.length).toBe(1);
    expect((await iframe.boundingBox())!.height).toBe(before!.height);
    await page.evaluate(() => window.scrollTo(0, 0));
    await iframe.scrollIntoViewIfNeeded();
    expect(requests).toHaveLength(1);
  });
}

test.describe('newsletter without JavaScript', () => {
  test.use({
    javaScriptEnabled: false,
  });
  test('newsletter keeps a subscription link without requesting its embed', async ({ page }) => {
    await page.goto('/en/introduction_to_event_sourcing/', {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.locator('#substack .subscription-fallback')).toHaveAttribute(
      'href',
      'https://www.architecture-weekly.com/subscribe',
    );
    await expect(page.locator('#substack iframe')).not.toHaveAttribute('src');
  });
});

test('newsletter loads automatically when viewport observers are unsupported', async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, 'IntersectionObserver');
  });
  await page.route('https://www.architecture-weekly.com/embed', (route) =>
    route.fulfill({
      body: 'Newsletter',
    }),
  );
  await page.goto('/en/introduction_to_event_sourcing/', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('#substack iframe')).toHaveAttribute(
    'src',
    'https://www.architecture-weekly.com/embed',
    { timeout: 10_000 },
  );
});

test('newsletter disconnects its viewport observer when navigating away', async ({ page }) => {
  await page.addInitScript(() => {
    const NativeObserver = window.IntersectionObserver;
    window.newsletterObservers = [];
    window.IntersectionObserver = class extends NativeObserver {
      disconnected = false;
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        super(callback, options);
        if (options?.rootMargin === '200px 0px') window.newsletterObservers.push(this);
      }
      disconnect() {
        this.disconnected = true;
        super.disconnect();
      }
    };
  });
  await page.goto('/en/introduction_to_event_sourcing/', {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForFunction(() => window.newsletterObservers.length === 1);
  await page.locator('header a[href="/en/articles/"]').first().click();
  await page.waitForURL('**/en/articles/');
  await page.waitForFunction(() =>
    window.newsletterObservers.every((observer) => observer.disconnected),
  );
});
