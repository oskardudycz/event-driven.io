import type { SearchHit } from '../../search/types.ts';
import * as styles from './Hit.module.css';
import React, { type ComponentProps, type ReactNode } from 'react';
import { highlightParts, snippet } from '../../search/snippets.ts';

const Highlight = ({ text, terms }: { text: string; terms: string[] }) =>
  highlightParts(text, terms).map((part, index) =>
    part.highlighted ? (
      <mark
        key={index}
        className={`search-highlight ${styles.searchHighlight}`}
      >
        {part.text}
      </mark>
    ) : (
      <React.Fragment key={index}>{part.text}</React.Fragment>
    ),
  );

const anchor = (props: ComponentProps<'a'>) => <a {...props} />;

export default function SearchResult({
  hit,
  lang,
  cover,
  renderLink = anchor,
}: {
  hit: SearchHit;
  lang: string;
  cover?: ReactNode;
  renderLink?: (
    _props: Pick<ComponentProps<'a'>, 'children' | 'className'> & {
      href: string;
    },
  ) => ReactNode;
}) {
  const sourceLabels: Record<string, string> =
    lang === 'pl'
      ? {
          posts: 'Artykuł',
          pages: 'Strona',
          'newsletter-pl': 'Newsletter',
          paths: 'Przewodnik',
          tags: 'Tag',
        }
      : {
          posts: 'Article',
          pages: 'Page',
          'newsletter-pl': 'Newsletter',
          paths: 'Guide',
          tags: 'Tag',
        };
  const details = [
    sourceLabels[hit.source] || hit.source,
    ...[hit.tags ?? []].flat(),
  ].filter(Boolean);

  return (
    <article
      className={`search-hit ${styles.searchHit}${cover ? ` search-hit-with-cover ${styles.searchHitWithCover}` : ''}`}
    >
      {renderLink({
        href: hit.path,
        className: `search-hit-link ${styles.searchHitLink}`,
        children: (
          <>
            {cover && (
              <div className={`search-hit-cover ${styles.searchHitCover}`}>
                {cover}
              </div>
            )}
            <div className={'search-hit-heading'}>
              <p className={`search-hit-meta ${styles.searchHitMeta}`}>
                {details.join(' · ')}
                {hit.date && (
                  <>
                    <span aria-hidden="true"> · </span>
                    <time dateTime={hit.date}>{hit.date}</time>
                  </>
                )}
                {hit.langKey !== lang && (
                  <span
                    className={`search-hit-language ${styles.searchHitLanguage}`}
                  >
                    {lang === 'pl' ? 'Po angielsku' : 'In Polish'}
                  </span>
                )}
              </p>
              <h2>
                <Highlight text={hit.title} terms={hit.terms} />
              </h2>
            </div>
            <p className={`search-hit-snippet ${styles.searchHitSnippet}`}>
              <Highlight
                text={snippet(hit.content, hit.terms)}
                terms={hit.terms}
              />
            </p>
          </>
        ),
      })}
    </article>
  );
}
