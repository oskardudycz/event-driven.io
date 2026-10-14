import type { TFunction } from 'i18next';
import { tagSlug } from './tag-slug.ts';

// Frontmatter stores the English tag; translations are keyed by its slug
// because tag names can contain i18next separators such as '.' or ':'.
export const tagLabel = (t: TFunction, tag: string): string =>
  t(`tags.labels.${tagSlug(tag)}`, { defaultValue: tag });

// Descriptions are optional per language. A missing one uses the default
// description rather than another language's text.
export const tagDescription = (t: TFunction, tag: string): string =>
  t(`tags.descriptions.${tagSlug(tag)}`, {
    fallbackLng: false,
    defaultValue: t('tags.defaultDescription', { tag: tagLabel(t, tag) }),
  });
