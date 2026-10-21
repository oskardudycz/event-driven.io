import React from 'react';
import { useTranslation } from 'react-i18next';
import type { SitePage } from '../lib/site.ts';
import type { RenderLink } from './Link/anchor.tsx';
import Bodytext from './Article/Bodytext.tsx';
import BlogView from './Blog/BlogView.tsx';
import ArchiveCard from './Blog/ArchiveCard.tsx';
import Talks from '../page-views/talks.tsx';
import { tagChips } from '../utils/tag-posts.ts';
import { tagLabel, tagDescription } from '../utils/tag-label.ts';
import { tagRoute } from '../utils/tag-routes.ts';
import ResponsiveImage from './Image/ResponsiveImage.tsx';
import NotFound from '../page-views/NotFound.tsx';
import Guides from '../page-views/Guides.tsx';
import Tag from '../page-views/Tag.tsx';

export default function PageContent({
  page,
  renderLink,
  hero,
}: {
  page: SitePage;
  renderLink: RenderLink;
  hero?: React.ReactNode;
}) {
  const { t } = useTranslation();
  const lang = page.context.lang;
  const archive = (
    <BlogView
      posts={page.articles}
      renderLink={renderLink}
      renderItem={({ node }) => (
        <ArchiveCard
          href={node.fields.slug}
          title={node.frontmatter.title}
          date={node.fields.prefix || ''}
          author={node.frontmatter.author}
          tags={(node.frontmatter.tags || []).map((tag) => tagLabel(t, tag))}
          excerpt={node.excerpt || ''}
          cover={
            node.frontmatter.cover?.responsive && (
              <ResponsiveImage
                image={node.frontmatter.cover.responsive}
                alt={node.frontmatter.title}
                sizes="(min-width: 1025px) 846px, (min-width: 1024px) 646px, (min-width: 690px) 606px, (min-width: 600px) calc(100vw - 84px), calc(100vw - 64px)"
              />
            )
          }
          renderLink={renderLink}
        />
      )}
      compactTop={page.kind !== 'newsletter'}
      {...(page.kind === 'home'
        ? { browseAllPath: '/articles/' }
        : {
            heading:
              page.kind === 'tags'
                ? tagLabel(t, page.context.tag || '')
                : page.kind === 'newsletter'
                  ? 'Newsletter'
                  : t('blog.allTitle'),
          })}
    >
      {page.kind === 'archive' && (
        <nav aria-label={t('tags.browse')}>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {tagChips(page.tagged || [], lang, (tag) => tagLabel(t, tag)).map(
              ({ slug, label }) => (
                <li key={slug}>
                  {renderLink({
                    href: tagRoute(lang, slug),
                    className:
                      'inline-block rounded-full border border-solid border-line px-3 py-1 text-caption text-ink transition-colors hover:border-brand-decoration',
                    children: label,
                  })}
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
      {page.kind === 'tags' && (
        <>
          {page.tagContent?.html ? (
            <Bodytext html={page.tagContent.html} />
          ) : (
            <p className="text-summary">
              {tagDescription(
                t,
                page.context.tag || '',
                page.tagContent?.description,
              )}
            </p>
          )}
          <p className="mt-2 text-caption text-muted">
            {t('tags.articleCount', { count: page.articles.length })}
          </p>
        </>
      )}
    </BlogView>
  );
  switch (page.kind) {
    case 'home':
      return (
        <>
          {hero}
          <section
            className="latestArticles scroll-mt-[var(--header-height-default)]"
            id="latest-articles"
          >
            <header className="mx-auto px-5 pt-10 sm:max-w-[var(--text-max-width-tablet)] sm:px-0 lg:max-w-[var(--text-max-width-desktop)]">
              <h2 className="text-[length:var(--font-size-xxl)] wrap-anywhere">
                {t('blog.latestTitle')}
              </h2>
            </header>
            {archive}
          </section>
        </>
      );
    case 'archive':
    case 'newsletter':
      return archive;
    case 'tags':
      return (
        <Tag
          data={{
            posts: { edges: page.articles },
            tagContent: page.tagContent
              ? {
                  html: page.tagContent.html,
                  frontmatter: {
                    ...(page.tagContent.description
                      ? { description: page.tagContent.description }
                      : {}),
                  },
                }
              : null,
          }}
          pageContext={page.context}
        />
      );
    case 'talks':
      return <Talks />;
    case 'guides':
      return (
        <Guides
          data={{
            guides: {
              nodes: page.articles.map(({ node }) => ({
                ...node,
                fields: {
                  pathSlug: node.fields.pathSlug!,
                  langKey: node.fields.langKey,
                },
              })),
            },
          }}
          pageContext={page.context}
        />
      );
    case 'notFound':
      return <NotFound />;
    default:
      return null;
  }
}
