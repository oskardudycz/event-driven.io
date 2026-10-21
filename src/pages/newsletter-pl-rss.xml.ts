import { feed } from '../lib/publication.ts';
import config from '../config.ts';
export const GET = () =>
  feed('newsletter-pl', `${config.siteTitle} — Architecture Weekly archive`);
