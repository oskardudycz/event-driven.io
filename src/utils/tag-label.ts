import type { TFunction } from 'i18next';
import { tagSlug } from './tag-slug.ts';

// Frontmatter stores the English tag; translations are keyed by its slug
// because tag names can contain i18next separators such as '.' or ':'.
export const tagLabel = (t: TFunction, tag: string): string =>
  t(`tags.labels.${tagSlug(tag)}`, { defaultValue: tag });
