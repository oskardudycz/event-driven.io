import _ from 'lodash';
import analyzer from 'webpack-bundle-analyzer';
import path from 'node:path';
import Promise from 'bluebird';
import filesystem from 'gatsby-source-filesystem';
import { DEFAULT_OPTIONS_BASE as DEFAULT_OPTIONS } from './src/i18n/settings.mjs';
import categoryGuides from './data/category-guides.json' with { type: 'json' };

const { BundleAnalyzerPlugin } = analyzer;
const { createFilePath } = filesystem;

import {
  categoriesForPost as categoriesForNode,
  categoriesForLanguage,
} from './src/utils/category-posts.mjs';

export const onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode });
    const fileNode = getNode(node.parent);
    const source = fileNode.sourceInstanceName;
    const separtorIndex = ~slug.indexOf('--') ? slug.indexOf('--') : 0;
    const shortSlugStart = separtorIndex ? separtorIndex + 2 : 0;

    const langFileNamePart = fileNode.relativePath.match(/(\w+)\.(\w+)\.(\w+)$/);

    const langKey = langFileNamePart ? langFileNamePart[2] : 'en';

    if (source !== 'parts') {
      createNodeField({
        node,
        name: `slug`,
        value: `${separtorIndex ? '/' : ''}${slug.substring(shortSlugStart)}`.replace(
          `/index.${langKey}/`,
          '/',
        ),
      });
    }
    createNodeField({
      node,
      name: `prefix`,
      value: separtorIndex ? slug.substring(1, separtorIndex) : '',
    });
    createNodeField({
      node,
      name: `source`,
      value: source,
    });
    createNodeField({
      node,
      name: `langKey`,
      value: langKey,
    });
  }
};

export const createPages = ({ graphql, actions, getNodesByType, reporter }) => {
  scheduleDevelopmentSearch({ getNodesByType, reporter });
  const { createPage, createRedirect } = actions;

  return new Promise((resolve, reject) => {
    const postTemplate = path.resolve('./src/templates/PostTemplate.js');
    const pageTemplate = path.resolve('./src/templates/PageTemplate.js');
    const categoryTemplate = path.resolve('./src/templates/CategoryTemplate.js');
    const { supportedLanguages } = DEFAULT_OPTIONS;

    // // Create index pages for all supported languages
    // supportedLanguages.forEach(langKey => {
    //   createPage({
    //     path: langKey === 'en' ? '/' : `/${langKey}/`,
    //     component: postTemplate,
    //     context: {
    //       langKey,
    //     },
    //   });
    // });

    resolve(
      graphql(`
        {
          allMarkdownRemark(
            filter: { fields: { slug: { ne: null } } }
            sort: { fields: { prefix: DESC } }
            limit: 1000
          ) {
            edges {
              node {
                id
                fields {
                  slug
                  prefix
                  source
                  langKey
                }
                frontmatter {
                  title
                  category
                  categories
                  related
                  redirectFrom
                  redirectAliases
                  useDefaultLangCanonical
                }
              }
            }
          }
        }
      `).then((result) => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
        }

        const items = result.data.allMarkdownRemark.edges;
        const availableLanguagesFor = (node) =>
          items
            .filter(
              (item) =>
                item.node.fields.source === node.fields.source &&
                item.node.fields.slug === node.fields.slug,
            )
            .map((item) => item.node.fields.langKey);
        const canonicalLanguagesFor = (node) =>
          availableLanguagesFor(node).filter((language) =>
            items.some(
              ({ node: candidate }) =>
                candidate.fields.source === node.fields.source &&
                candidate.fields.slug === node.fields.slug &&
                candidate.fields.langKey === language &&
                !candidate.frontmatter.useDefaultLangCanonical,
            ),
          );
        const relatedFor = (node) => {
          const requested = node.frontmatter.related || [];
          return requested.map((slug) => {
            const match = items.find(
              (item) =>
                item.node.id !== node.id &&
                item.node.fields.slug === `/${slug}/` &&
                item.node.fields.source === node.fields.source &&
                item.node.fields.langKey === node.fields.langKey &&
                !item.node.frontmatter.useDefaultLangCanonical,
            );
            if (!match) {
              throw new Error(
                `Invalid related article "${slug}" for ${node.fields.langKey}${node.fields.slug}`,
              );
            }
            return match.node.id;
          });
        };

        supportedLanguages.forEach((supportedLangKey) => {
          const categoryList = categoriesForLanguage(
            items.map(({ node }) => node),
            supportedLangKey,
          );
          categoryList.forEach(([category, categoryPosts]) => {
            const categorySlug = _.kebabCase(category);
            const availableLanguages = supportedLanguages.filter((langKey) =>
              items.some(
                (item) =>
                  item.node.fields.source === 'posts' &&
                  item.node.fields.langKey === langKey &&
                  !item.node.frontmatter.useDefaultLangCanonical &&
                  categoriesForNode(item.node).some(
                    (itemCategory) => _.kebabCase(itemCategory) === categorySlug,
                  ),
              ),
            );
            const guide = categoryGuides.find(
              (item) => item.language === supportedLangKey && item.slug === categorySlug,
            );

            createPage({
              path: `/${supportedLangKey}/category/${categorySlug}/`,
              component: categoryTemplate,
              context: {
                category,
                lang: supportedLangKey,
                langKey: supportedLangKey,
                originalPath: `/category/${categorySlug}/`,
                availableLanguages,
                categoryPostIds: categoryPosts.map((node) => node.id),
                categoryDescription: guide ? guide.description : undefined,
                recommendedSlugs: guide ? guide.recommended : [],
              },
            });
          });

          // Create posts
          const posts = items.filter(
            (item) =>
              item.node.fields.source === 'posts' && item.node.fields.langKey == supportedLangKey,
          );
          posts.forEach(({ node }, index) => {
            const slug = node.fields.slug;
            const langKey = node.fields.langKey;
            const next = index === 0 ? undefined : posts[index - 1].node;
            const prev = index === posts.length - 1 ? undefined : posts[index + 1].node;
            const source = node.fields.source;
            const path = `/${langKey}${slug}`;

            if (langKey === 'en') {
              const aliases = new Set(
                [node.frontmatter.redirectFrom, ...(node.frontmatter.redirectAliases || [])].filter(
                  Boolean,
                ),
              );
              aliases.delete(path);
              aliases.forEach((fromPath) =>
                createRedirect({
                  fromPath,
                  toPath: path,
                  isPermanent: true,
                  statusCode: 301,
                  redirectInBrowser: process.env.NODE_ENV === 'development',
                }),
              );
            }

            createPage({
              path,
              component: postTemplate,
              context: {
                slug,
                lang: langKey,
                langKey,
                prev,
                next,
                source,
                originalPath: slug,
                availableLanguages: availableLanguagesFor(node),
                canonicalLanguages: canonicalLanguagesFor(node),
                relatedIds: relatedFor(node),
                excludeFromSitemap: Boolean(node.frontmatter.useDefaultLangCanonical),
              },
            });
          });

          // Create posts
          const newsletterPlPosts = items.filter(
            (item) =>
              item.node.fields.source === 'newsletter-pl' &&
              item.node.fields.langKey == supportedLangKey,
          );
          newsletterPlPosts.forEach(({ node }, index) => {
            const slug = node.fields.slug;
            const langKey = node.fields.langKey;
            const next = index === 0 ? undefined : newsletterPlPosts[index - 1].node;
            const prev =
              index === newsletterPlPosts.length - 1
                ? undefined
                : newsletterPlPosts[index + 1].node;
            const source = node.fields.source;
            const path = `/${langKey}${slug}`;

            createPage({
              path,
              component: postTemplate,
              context: {
                slug,
                lang: langKey,
                langKey,
                prev,
                next,
                source,
                originalPath: slug,
                availableLanguages: availableLanguagesFor(node),
                canonicalLanguages: canonicalLanguagesFor(node),
                relatedIds: relatedFor(node),
                excludeFromSitemap: Boolean(node.frontmatter.useDefaultLangCanonical),
              },
            });
          });
        });

        // and pages.
        const pages = items.filter((item) => item.node.fields.source === 'pages');
        pages.forEach(({ node }) => {
          const slug = node.fields.slug;
          const langKey = node.fields.langKey;
          const source = node.fields.source;
          const path = `/${langKey}${slug}`;

          createPage({
            path: path,
            component: pageTemplate,
            context: {
              slug,
              source,
              lang: langKey,
              langKey,
              originalPath: slug,
              availableLanguages: availableLanguagesFor(node),
              canonicalLanguages: canonicalLanguagesFor(node),
              excludeFromSitemap: Boolean(node.frontmatter.useDefaultLangCanonical),
            },
          });
        });
      }),
    );
  });
};

/**
 * Makes sure to create localized paths for each file in the /pages folder.
 * For example, pages/404.js will be converted to /en/404.js and /el/404.js and
 * it will be accessible from https:// .../en/404/ and https:// .../el/404/
 */

export const onCreatePage = async (
  { page, actions: { createPage, deletePage, createRedirect } },
  pluginOptions,
) => {
  const { supportedLanguages, defaultLanguage, notFoundPage, excludedPages, deleteOriginalPages } =
    {
      ...DEFAULT_OPTIONS,
      ...pluginOptions,
    };

  const isEnvDevelopment = process.env.NODE_ENV === 'development';
  const originalPath = page.path;
  const is404 = originalPath.includes(notFoundPage);

  // return early if page is exluded
  if (excludedPages.includes(originalPath)) {
    return;
  }

  // Always delete the original page (since we are gonna create localized versions of it) header
  await deletePage(page);

  // If the user didn't want to delete the original pages, we re-create them with the proper context
  // (currently the only way to add new context to a page is to delete and re-create it
  // https://www.gatsbyjs.org/docs/creating-and-modifying-pages/#pass-context-to-pages
  if (!deleteOriginalPages) {
    await createPage({
      ...page,
      context: {
        ...page.context,
        originalPath,
        lang: defaultLanguage,
        langKey: defaultLanguage,
      },
    });
  }

  // Regardless of whether the original page was deleted or not, create the localized versions of
  // the current page
  await Promise.all(
    supportedLanguages.map(async (lang) => {
      const localizedPath = `/${lang}${page.path}`;

      // create a redirect based on the accept-language header
      createRedirect({
        fromPath: originalPath,
        toPath: localizedPath,
        conditions: { language: lang },
        isPermanent: false,
        redirectInBrowser: isEnvDevelopment,
        statusCode: is404 ? 404 : 301,
      });

      await createPage({
        ...page,
        path: localizedPath,
        matchPath: page.matchPath ? `/${lang}${page.matchPath}` : undefined,
        context: {
          ...page.context,
          originalPath,
          lang,
          langKey: lang,
          availableLanguages: supportedLanguages,
        },
      });
    }),
  );

  // Create a fallback redirect if the language is not supported or the
  // Accept-Language header is missing for some reason.
  // We only do that if the originalPath is not present anymore (i.e. the original page was deleted)
  if (deleteOriginalPages) {
    createRedirect({
      fromPath: originalPath,
      toPath: `/${defaultLanguage}${page.path}`,
      isPermanent: false,
      redirectInBrowser: isEnvDevelopment,
      statusCode: is404 ? 404 : 301,
    });
  }
};

export const onCreateWebpackConfig = ({ stage, actions }) => {
  switch (stage) {
    case `build-javascript`:
      if (process.env.ANALYZE === 'true') {
        actions.setWebpackConfig({
          plugins: [
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: './report/treemap.html',
              openAnalyzer: false,
              logLevel: 'error',
              defaultSizes: 'gzip',
            }),
          ],
        });
      }
      break;
  }
};

function createRedirectsToOldPosts(isEnvDevelopment, createRedirect) {
  [
    {
      from: 'http://oskar-dudycz.pl',
      to: 'https://event-driven.io/pl',
    },
    {
      from: 'https://oskar-dudycz.pl',
      to: 'https://event-driven.io/pl',
    },
    {
      from: 'http://oskar-dudycz.pl/*',
      to: 'https://event-driven.io/:splat',
    },
    {
      from: 'https://oskar-dudycz.pl/*',
      to: 'https://event-driven.io/:splat',
    },
    {
      from: '/2011/09/21/witam-jest-to-moj-pierwszy-wpis-na',
      to: '/pl/inauguracja',
    },
    {
      from: '/2011/09/22/wielokrotny-join-we-fluentnhibernate',
      to: '/pl/wielokrotny_join_we_fluentnhibernate',
    },
    {
      from: '/2011/10/01/jak-odblokowac-workspace-w-tfs',
      to: '/pl/jak_odblokowac_workspace_w_tfs',
    },
    {
      from: '/2011/10/06/bad-cannot-update-przy-pobieraniu',
      to: '/pl/blad_cannot_update_przy_pobieraniu',
    },
    {
      from: '/2011/10/17/ciekawostki-cz-1',
      to: '/pl/ciekawostki_equals',
    },
    {
      from: '/2011/11/09/scrum-i-team-foundation-system-cz1',
      to: '/pl/scrum_i_team_foundation_server_01',
    },
    {
      from: '/2011/11/11/scrum-i-team-foundation-server-cz2',
      to: '/pl/scrum_i_team_foundation_server_02',
    },
    {
      from: '/2011/11/16/scrum-i-team-foundation-server-cz3',
      to: '/pl/scrum_i_team_foundation_server_03',
    },
    {
      from: '/2011/11/22/scrum-i-team-foundation-server-cz4',
      to: '/pl/scrum_i_team_foundation_server_04',
    },
    {
      from: '/2011/11/30/scrum-i-team-foundation-server-cz5',
      to: '/pl/scrum_i_team_foundation_server_05',
    },
    {
      from: '/2011/12/10/scrum-i-team-foundation-server-cz6',
      to: '/pl/scrum_i_team_foundation_server_06',
    },
    {
      from: '/2012/02/05/wspodzielenie-klas-w-net-silverlight-i',
      to: '/pl/multiplatforomowe_aplikacje_w_net_01',
    },
    {
      from: '/2012/02/05/multiplatforomowe-aplikacje-w-ne-2',
      to: '/pl/multiplatforomowe_aplikacje_w_net_02',
    },
    {
      from: '/2012/02/05/multiplatforomowe-aplikacje-w-net_05',
      to: '/pl/multiplatforomowe_aplikacje_w_net_03',
    },
    {
      from: '2012/03/23/wrocnet-team-foundation-server-to-nie',
      to: '/pl/wrocnet_team_foundation_server_to_nie_svn',
    },
    {
      from: '2012/04/15/jak-z-kilku-dllek-zrobic-jedna-czyli',
      to: '/pl/jak_z_kilku_dllek_zrobic_jedna_illmerge',
    },
    {
      from: '/2012/10/30/serializacja-dla-net-45-oraz-windows',
      to: '/pl/serializacja_dla_net_45_oraz_windows',
    },
    {
      from: '/2012/11/08/prezent-od-microsoft-darmowa-ksiazka-o',
      to: '/pl/darmowa_ksiazka_o_windows_8',
    },
    {
      from: '/2014/05/31/refleksyjnie-plus-pierwszy-w-historii-vlog',
      to: '/pl/refleksyjnie_plus_pierwszy_w_historii_vlog',
    },
    {
      from: '/2014/06/10/na-temat-branzy',
      to: '/pl/na_temat_branzy',
    },
    {
      from: '/2015/01/31/borys-najlepiej-dryblowa',
      to: '/pl/borys_najlepiej_dryblowal',
    },
    {
      from: '/2015/02/17/sqlowa-ciekawostka-1-uwazaj-na-exists',
      to: '/pl/sqlowa_ciekawostka_uwazaj_na_exists',
    },
    {
      from: '2015/03/29/englishman-in-new-york-czyli-jak',
      to: '/pl/englishman_in_new_york_czyli_net_w_mssql',
    },
    {
      from: '/2015/10/31/what-really-grind-my-gears-1',
      to: '/pl/what_really_grind_my_gears_if',
    },
    {
      from: '/2015/12/07/cierpienia-niemodego-bloggera-czyli',
      to: '/pl/cierpienia_niemlodego_bloggera',
    },
    {
      from: '/2016/01/06/nauka-uczenia-sie',
      to: '/pl/nauka_uczenia_sie',
    },
    {
      from: '/2017/01/06/metallica-skonczyla-sie-na-kill-em-all-a-ja-ide-w-open-sourcey',
      to: '/pl/metallica_skonczyla_sie_na_kill_em_all_a_ja_ide_w_open_sourcey',
    },
    {
      from: '/2017/11/05/co-gra-na-gitarze-moze-dac-programiscie',
      to: '/pl/o_tym_co_gra_na_gitarze_moze_dac_programiscie',
    },
    {
      from: '/2018/04/18/mezczyzna-w-it',
      to: '/pl/mezczyzna_w_IT',
    },
    {
      from: '/2019/11/30/zrodla-otwartosci',
      to: '/pl/zrodla_otwartosci',
    },
    {
      from: '/2020/02/16/relacja-z-domain-driven-design-europe-2020-cz-1-event-sourcing',
      to: '/pl/relacja_z_doman_driven_design_europe_2020',
    },
    {
      from: '/2020/10/01/jak-zaczac-z-open-source',
      to: '/pl/jak_zaczac_z_open_source',
    },
    {
      from: '/pl/how_to_configure_algolia_for_your_site',
      to: '/pl/how_to_configure_algolia_for_your_site_search',
    },
    {
      from: '/en/how_to_configure_algolia_for_your_site',
      to: '/en/how_to_configure_algolia_for_your_site_search',
    },
  ].forEach((r) => {
    createRedirect({
      fromPath: r.from,
      toPath: r.to,
      isPermanent: true,
      redirectInBrowser: isEnvDevelopment,
      statusCode: 301,
    });
  });
}

export const onPreBuild = ({ actions: { createRedirect } }, pluginOptions) => {
  const isEnvDevelopment = process.env.NODE_ENV === 'development';
  const { notFoundPage } = { ...DEFAULT_OPTIONS, ...pluginOptions };

  // These redirects are global. Register them once instead of once for every page handled by
  // onCreatePage.
  createRedirectsToOldPosts(isEnvDevelopment, createRedirect);

  // we add a generic redirect to the "not found path" for every path that's not present in the app.
  // This rule needs to be the last one (so that it only kicks in if nothing else matched before),
  // thus it's added after all the page-related hooks have finished (hence "onPreBuild")

  if (notFoundPage) {
    createRedirect({
      fromPath: '/*',
      toPath: notFoundPage,
      isPermanent: false,
      redirectInBrowser: isEnvDevelopment,
      statusCode: 302,
    });
  }
};

export const createSchemaCustomization = ({ actions }) => {
  actions.createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter
      fields: MarkdownRemarkFields
    }
    type MarkdownRemarkFrontmatter @dontInfer {
      title: String
      publishedAt: String
      description: String
      summary: String
      category: String
      categories: [String]
      related: [String]
      cover: File @fileByRelativePath
      author: String
      disqusId: String
      useDefaultLangCanonical: Boolean
      redirectFrom: String
      redirectAliases: [String]
      menuTitle: String
      icon: String
    }
    type MarkdownRemarkFields @dontInfer {
      slug: String
      prefix: String
      source: String
      langKey: String
    }
  `);
};

export const onPostBuild = async ({ getNodesByType, reporter }) => {
  const { writeSearchIndexes } = await import('./scripts/build-search-index.mjs');
  const metrics = await writeSearchIndexes(getNodesByType('MarkdownRemark'), 'public');
  reporter.info(`Local search indexes: ${JSON.stringify(metrics)}`);
};

// Gatsby develop serves these same files; refresh after live Markdown changes.
let developmentSearchReady = false;
let developmentSearchTimer;
let developmentSearchWork = Promise.resolve();
function scheduleDevelopmentSearch({ getNodesByType, reporter }) {
  if (!developmentSearchReady || process.env.NODE_ENV !== 'development') return;
  clearTimeout(developmentSearchTimer);
  developmentSearchTimer = setTimeout(() => {
    developmentSearchWork = developmentSearchWork
      .then(async () => {
        const { writeSearchIndexes } = await import('./scripts/build-search-index.mjs');
        await writeSearchIndexes(getNodesByType('MarkdownRemark'), 'public');
      })
      .catch((error) => reporter.error('Could not refresh local search indexes', error));
  }, 500);
}
export const onPostBootstrap = async ({ getNodesByType }) => {
  if (process.env.NODE_ENV !== 'development') return;
  const { writeSearchIndexes } = await import('./scripts/build-search-index.mjs');
  await writeSearchIndexes(getNodesByType('MarkdownRemark'), 'public');
  developmentSearchReady = true;
};
