import React, { useId } from 'react';
import { anchor, type RenderLink } from '../Link/anchor.tsx';

import { FaCalendar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { FaTag } from 'react-icons/fa';
import { FaMapSigns } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import type { GuideStep, TagLink } from '../../types/content.ts';
import { tagLabel } from '../../utils/tag-label.ts';

const Entry = ({
  id,
  emphasis = false,
  children,
}: React.PropsWithChildren<{ id?: string; emphasis?: boolean }>) => (
  <span
    id={id}
    className={`my-1.25 mr-2.5 flex items-center uppercase ${emphasis ? 'font-semibold' : ''}`}
  >
    {children}
  </span>
);

const MetaGroup = (props: {
  icon: React.ReactNode;
  label: string;
  items: { key: string; content: React.ReactNode }[];
}) => {
  const { icon, label, items } = props;
  const labelId = useId();
  if (items.length === 0) return null;

  return (
    <div role="group" aria-labelledby={labelId} className="flex flex-wrap">
      <Entry id={labelId} emphasis>
        {icon}
        {label}
      </Entry>
      {items.map(({ key, content }, index) => (
        <Entry key={key}>
          {content}
          {index < items.length - 1 && (
            <span
              aria-hidden="true"
              className="ml-2.5 text-[color:var(--color-link)]"
            >
              ·
            </span>
          )}
        </Entry>
      ))}
    </div>
  );
};

const Meta = (props: {
  prefix?: string | undefined;
  author?: string | undefined;
  tags?: TagLink[] | undefined;
  guides?: GuideStep[] | undefined;
  renderLink?: RenderLink;
}) => {
  const { t } = useTranslation();
  const {
    prefix,
    author: authorName,
    tags = [],
    guides = [],
    renderLink = anchor,
  } = props;

  return (
    <div className="meta my-5 flex flex-col text-[0.8em] sm:mt-7.5 [&_svg]:mr-1.25 [&_svg]:fill-[var(--icon-color)]">
      <div className="flex flex-wrap">
        <Entry>
          <FaCalendar size={18} /> {prefix}
        </Entry>
        <Entry>
          <FaUser size={18} /> {authorName}
        </Entry>
      </div>
      <MetaGroup
        icon={<FaTag size={18} />}
        label={t('tags.metaLabel')}
        items={tags.map(({ tag, path }) => ({
          key: tag,
          content: path
            ? renderLink({ href: path, children: tagLabel(t, tag) })
            : tagLabel(t, tag),
        }))}
      />
      <MetaGroup
        icon={<FaMapSigns size={18} />}
        label={t('guides.metaLabel')}
        items={guides.map(({ title, path, step, total }) => ({
          key: path,
          content: renderLink({
            href: path,
            children: `${title} (${step}/${total})`,
          }),
        }))}
      />
    </div>
  );
};

export default Meta;
