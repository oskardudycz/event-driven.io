import type { GuideStep } from '../../types/content.ts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '../Link/index.tsx';

const GuideSteps = ({ guides = [] }: { guides?: GuideStep[] | undefined }) => {
  const { t } = useTranslation();
  if (guides.length === 0) return null;

  return (
    <aside
      aria-label={t('guides.inGuides')}
      className="guideSteps my-gutter rounded-panel border border-solid border-line p-gutter text-body"
    >
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {guides.map((guide) => (
          <li key={guide.path}>
            {t('guides.guide')}:{' '}
            <Link to={guide.path} className="underline">
              {guide.title}
            </Link>{' '}
            — {t('guides.step', { step: guide.step, total: guide.total })}
            {guide.next && (
              <>
                {' · '}
                <Link to={guide.next.path} className="underline">
                  {t('guides.next')}: {guide.next.title}
                </Link>
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default GuideSteps;
