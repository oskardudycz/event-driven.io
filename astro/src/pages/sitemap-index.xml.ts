import config from '../../../content/meta/config.ts';
export const GET = () =>
  new Response(
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${config.siteUrl}/sitemap-0.xml</loc></sitemap></sitemapindex>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
