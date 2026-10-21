import { feed } from '../lib/publication.ts';
import config from '../../../content/meta/config.ts';
export const GET = () =>
  feed('newsletter-pl', `${config.siteTitle} — Architecture Weekly archive`);
