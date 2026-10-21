import { redirects } from '../lib/publication.ts';

// Astro reserves underscore-prefixed source files, so name this endpoint with
// a static path parameter rather than an ignored `_redirects.ts` file.
export function getStaticPaths() {
  return [{ params: { publication: '_redirects' } }];
}

export const GET = redirects;
