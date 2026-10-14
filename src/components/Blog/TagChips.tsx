import type { TagChip } from '../../utils/tag-posts.ts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '../Link/index.tsx';
import { tagRoute } from '../../utils/tag-routes.ts';

const TagChips = ({
  language,
  chips,
}: {
  language: string;
  chips: TagChip[];
}) => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t('tags.browse')}>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {chips.map(({ slug, label }) => (
          <li key={slug}>
            <Link
              to={tagRoute(language, slug)}
              className="inline-block rounded-full border border-solid border-line px-3 py-1 text-caption text-ink transition-colors hover:border-brand-decoration"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TagChips;
