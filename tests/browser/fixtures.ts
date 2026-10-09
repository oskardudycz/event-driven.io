import {
  test as base,
  expect,
  type BrowserContext,
  type Page,
} from '@playwright/test';

async function isolateExternalRequests(
  context: BrowserContext,
  baseURL: string,
) {
  const origin = new URL(baseURL).origin;
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url());
    return url.origin === origin ? route.continue() : route.abort();
  });
}

export const test = base.extend<{
  isolateExternalRequests: void;
  otherPage: Page;
}>({
  // Individual page.route mocks take precedence over this context-level policy.
  isolateExternalRequests: [
    async ({ context, baseURL }, provide) => {
      await isolateExternalRequests(context, baseURL!);
      await provide();
    },
    { auto: true },
  ],
  // Locale isolation requires separate storage, not two tabs in the same context.
  otherPage: async ({ browser, baseURL }, provide) => {
    const context = await browser.newContext(baseURL ? { baseURL } : {});
    try {
      await isolateExternalRequests(context, baseURL!);
      await provide(await context.newPage());
    } finally {
      await context.close();
    }
  },
});

export { expect };
