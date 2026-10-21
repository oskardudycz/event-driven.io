import i18next from 'i18next';
import { DEFAULT_OPTIONS } from '../i18n/constants.ts';
import { tagDescription, tagLabel } from '../utils/tag-label.ts';
import type { SitePage } from './site.ts';
const translations = i18next.createInstance();
void translations.init({ ...DEFAULT_OPTIONS.i18nextConfig, initAsync: false });
export function pageSeo(
  page: Pick<SitePage, 'kind' | 'context'> & {
    tagContent?: { description?: string | undefined };
  },
): NonNullable<SitePage['seo']> {
  const t = translations.getFixedT(page.context.lang);
  switch (page.kind) {
    case 'post':
      return { schemaType: 'BlogPosting' };
    case 'page':
      return { noIndex: page.context.originalPath === '/success/' };
    case 'guide':
      return { schemaType: 'CollectionPage' };
    case 'guides':
      return {
        title: t('guides.title'),
        description: t('guides.description'),
        schemaType: 'CollectionPage',
      };
    case 'archive':
      return {
        title: t('blog.allTitle'),
        description: t('blog.allIntro'),
        schemaType: 'CollectionPage',
      };
    case 'newsletter':
      return {
        title: 'Newsletter',
        description:
          "Articles from Oskar Dudycz's software architecture newsletter.",
        schemaType: 'CollectionPage',
      };
    case 'contact':
      return {
        title: t('contact.seoTitle'),
        description: t('contact.description'),
        schemaType: 'ContactPage',
      };
    case 'talks':
      return {
        title: t('talks.title'),
        description: t('talks.videosIntro'),
        schemaType: 'CollectionPage',
      };
    case 'search':
      return {
        title: page.context.lang === 'pl' ? 'Szukaj' : 'Search',
        noIndex: true,
      };
    case 'tags':
      return {
        title: t('tags.seoTitle', { tag: tagLabel(t, page.context.tag || '') }),
        description: tagDescription(
          t,
          page.context.tag || '',
          page.tagContent?.description,
        ),
        schemaType: 'CollectionPage',
      };
    default:
      return {};
  }
}
