import type { GuideStep } from '../../types/content.ts';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { anchor, type RenderLink } from '../Link/anchor.tsx';

const GuideSteps = ({
  guides = [],
  renderLink = anchor,
}: {
  guides?: GuideStep[] | undefined;
  renderLink?: RenderLink;
}) => {
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
            {renderLink({
              href: guide.path,
              className: 'underline',
              children: <>{guide.title}</>,
            })}{' '}
            — {t('guides.step', { step: guide.step, total: guide.total })}
            {guide.next && (
              <>
                {' · '}
                {renderLink({
                  href: guide.next.path,
                  className: 'underline',
                  children: (
                    <>
                      {t('guides.next')}: {guide.next.title}
                    </>
                  ),
                })}
              </>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default GuideSteps;
