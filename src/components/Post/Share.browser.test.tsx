import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import Share from './Share.tsx';
import config from '../../config.ts';

for (const language of ['en', 'pl']) {
  test(`${language} sharing sends the current title and localized article URL`, async () => {
    const title = 'Zażółć & event sourcing';
    const url = `${config.siteUrl}${config.pathPrefix}/${language}/example/`;
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    try {
      const screen = await render(
        <Share
          post={{
            fields: { slug: '/example/', langKey: language },
            frontmatter: { title },
          }}
        />,
      );
      for (const provider of [
        {
          name: 'X share',
          host: 'x.com',
          path: '/intent/post',
          urlKey: 'url',
          titleKey: 'text',
        },
        {
          name: 'Facebook share',
          host: 'www.facebook.com',
          path: '/sharer/sharer.php',
          urlKey: 'u',
        },
        {
          name: 'LinkedIn share',
          host: 'linkedin.com',
          path: '/shareArticle',
          urlKey: 'url',
        },
      ]) {
        open.mockClear();
        await screen.getByRole('button', { name: provider.name }).click();
        expect(open).toHaveBeenCalledOnce();
        const destination = new URL(String(open.mock.calls[0]![0]));
        expect(destination.hostname).toBe(provider.host);
        expect(destination.pathname).toBe(provider.path);
        expect(destination.searchParams.get(provider.urlKey)).toBe(url);
        if (provider.titleKey)
          expect(destination.searchParams.get(provider.titleKey)).toBe(title);
      }
    } finally {
      open.mockRestore();
    }
  });
}
