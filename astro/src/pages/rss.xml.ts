import { feed } from '../lib/publication.ts';
import config from '../../../content/meta/config.ts';
export const GET = () => feed('posts', `${config.siteTitle} — articles`);
