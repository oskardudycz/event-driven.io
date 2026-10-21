import type { APIRoute } from 'astro';

export function getStaticPaths() {
  return [undefined, 'en', 'pl'].map((locale) => ({ params: { locale } }));
}

// Native endpoints preserve the literal legacy filename while the page template
// keeps the directory route used by Netlify's localized 404 rules.
export const GET: APIRoute = ({ params, rewrite }) =>
  rewrite(`/${params.locale ? params.locale + '/' : ''}404/`);
