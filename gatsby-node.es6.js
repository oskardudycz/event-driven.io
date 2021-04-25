//const webpack = require("webpack");
const _ = require("lodash");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const path = require("path");
const Promise = require("bluebird");
import { DEFAULT_OPTIONS } from "./src/i18n/constants";

const { createFilePath } = require(`gatsby-source-filesystem`);

export const onCreateNode = ({ node, getNode, actions }) => {
  const { createNodeField } = actions;
  if (node.internal.type === `MarkdownRemark`) {
    const slug = createFilePath({ node, getNode });
    const fileNode = getNode(node.parent);
    const source = fileNode.sourceInstanceName;
    const separtorIndex = ~slug.indexOf("--") ? slug.indexOf("--") : 0;
    const shortSlugStart = separtorIndex ? separtorIndex + 2 : 0;

    const langFileNamePart = fileNode.relativePath.match(/(\w+)\.(\w+)\.(\w+)$/);

    const langKey = langFileNamePart ? langFileNamePart[2] : "en";

    if (source !== "parts") {
      createNodeField({
        node,
        name: `slug`,
        value: `${separtorIndex ? "/" : ""}${slug.substring(shortSlugStart)}`.replace(
          `/index.${langKey}/`,
          "/"
        )
      });
    }
    createNodeField({
      node,
      name: `prefix`,
      value: separtorIndex ? slug.substring(1, separtorIndex) : ""
    });
    createNodeField({
      node,
      name: `source`,
      value: source
    });
    createNodeField({
      node,
      name: `langKey`,
      value: langKey
    });
  }
};

export const createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return new Promise((resolve, reject) => {
    const postTemplate = path.resolve("./src/templates/PostTemplate.js");
    const pageTemplate = path.resolve("./src/templates/PageTemplate.js");
    const categoryTemplate = path.resolve("./src/templates/CategoryTemplate.js");
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
      graphql(
        `
          {
            allMarkdownRemark(
              filter: { fields: { slug: { ne: null } } }
              sort: { fields: [fields___prefix], order: DESC }
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
                  }
                }
              }
            }
          }
        `
      ).then(result => {
        if (result.errors) {
          console.log(result.errors);
          reject(result.errors);
        }

        const items = result.data.allMarkdownRemark.edges;

        supportedLanguages.forEach(supportedLangKey => {
          // Create category list
          const categorySet = new Set();
          items
            .filter(
              edge =>
                edge.node.fields.langKey === supportedLangKey && edge.node.fields.source === "posts"
            )
            .forEach(edge => {
              const {
                node: {
                  frontmatter: { category }
                }
              } = edge;

              if (category && category !== null) {
                categorySet.add(category);
              }
            });

          // Create category pages
          const categoryList = Array.from(categorySet);

          categoryList.forEach(category => {
            createPage({
              path: `/${supportedLangKey}/category/${_.kebabCase(category)}/`,
              component: categoryTemplate,
              context: {
                category,
                lang: supportedLangKey,
                langKey: supportedLangKey
              }
            });
          });

          // Create posts
          const posts = items.filter(
            item =>
              item.node.fields.source === "posts" && item.node.fields.langKey == supportedLangKey
          );
          posts.forEach(({ node }, index) => {
            const slug = node.fields.slug;
            const langKey = node.fields.langKey;
            const next = index === 0 ? undefined : posts[index - 1].node;
            const prev = index === posts.length - 1 ? undefined : posts[index + 1].node;
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
                source
              }
            });
          });

          // Create posts
          const newsletterPlPosts = items.filter(
            item =>
              item.node.fields.source === "newsletter-pl" &&
              item.node.fields.langKey == supportedLangKey
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
                source
              }
            });
          });
        });

        // and pages.
        const pages = items.filter(item => item.node.fields.source === "pages");
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
              langKey
            }
          });
        });
      })
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
  pluginOptions
) => {
  // // page.matchPath is a special key that's used for matching pages
  // // only on the client.
  // if (page.path.match(/^\/account/)) {
  //   page.matchPath = "/account/*"
  // }
  const {
    supportedLanguages,
    defaultLanguage,
    notFoundPage,
    excludedPages,
    deleteOriginalPages
  } = {
    ...DEFAULT_OPTIONS,
    ...pluginOptions
  };

  const isEnvDevelopment = process.env.NODE_ENV === "development";
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
        langKey: defaultLanguage
      }
    });
  }

  createRedirectsToOldPosts(isEnvDevelopment, createRedirect);

  // Regardless of whether the original page was deleted or not, create the localized versions of
  // the current page
  await Promise.all(
    supportedLanguages.map(async lang => {
      const localizedPath = `/${lang}${page.path}`;

      // create a redirect based on the accept-language header
      createRedirect({
        fromPath: originalPath,
        toPath: localizedPath,
        Language: lang,
        isPermanent: false,
        redirectInBrowser: isEnvDevelopment,
        statusCode: is404 ? 404 : 301
      });

      await createPage({
        ...page,
        path: localizedPath,
        matchPath: page.matchPath ? `/${lang}${page.matchPath}` : undefined,
        context: {
          ...page.context,
          originalPath,
          lang,
          langKey: lang
        }
      });
    })
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
      statusCode: is404 ? 404 : 301
    });
  }
};

export const onCreateWebpackConfig = ({ stage, loaders, actions }, options) => {
  switch (stage) {
    case `build-javascript`:
      actions.setWebpackConfig({
        plugins: [
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            reportFilename: "./report/treemap.html",
            openAnalyzer: true,
            logLevel: "error",
            defaultSizes: "gzip"
          })
        ]
      });
      break;
    case "build-html":
      /*
       * During the build step, `auth0-js` will break because it relies on
       * browser-specific APIs. Fortunately, we don't need it during the build.
       * Using Webpack's null loader, we're able to effectively ignore `auth0-js`
       * during the build. (See `src/utils/auth.js` to see how we prevent this
       * from breaking the app.)
       */
      actions.setWebpackConfig({
        module: {
          rules: [
            {
              test: /auth0-js/,
              use: loaders.null()
            }
          ]
        }
      });
      break;
  }
};

function createRedirectsToOldPosts(isEnvDevelopment, createRedirect) {
  [
    {
      from: "/2011/12/10/scrum-i-team-foundation-server-cz6/",
      to: "/pl/scrum_i_team_foundation_server_06"
    },
    {
      from: "/2012/02/05/wspodzielenie-klas-w-net-silverlight-i/",
      to: "/pl/multiplatforomowe_aplikacje_w_net_01"
    },
    {
      from: "/2012/02/05/multiplatforomowe-aplikacje-w-ne-2/",
      to: "/pl/multiplatforomowe_aplikacje_w_net_02"
    },
    {
      from: "/2012/02/05/multiplatforomowe-aplikacje-w-net_05/",
      to: "/pl/multiplatforomowe_aplikacje_w_net_03"
    },
    {
      from: "2012/03/23/wrocnet-team-foundation-server-to-nie",
      to: "/pl/wrocnet_team_foundation_server_to_nie_svn"
    },
    {
      from: "2012/04/15/jak-z-kilku-dllek-zrobic-jedna-czyli",
      to: "/pl/jak_z_kilku_dllek_zrobic_jedna_illmerge"
    },
    {
      from: "/2012/10/30/serializacja-dla-net-45-oraz-windows",
      to: "/pl/serializacja_dla_net_45_oraz_windows"
    },
    {
      from: "/2012/11/08/prezent-od-microsoft-darmowa-ksiazka-o",
      to: "/pl/darmowa_ksiazka_o_windows_8"
    },
    {
      from: "/2014/05/31/refleksyjnie-plus-pierwszy-w-historii-vlog",
      to: "/pl/refleksyjnie_plus_pierwszy_w_historii_vlog"
    },
    {
      from: "/2014/06/10/na-temat-branzy",
      to: "/pl/na_temat_branzy"
    },
    {
      from: "/2015/01/31/borys-najlepiej-dryblowa",
      to: "/pl/borys_najlepiej_dryblowal"
    },
    {
      from: "/2015/02/17/sqlowa-ciekawostka-1-uwazaj-na-exists",
      to: "/pl/sqlowa_ciekawostka_uwazaj_na_exists"
    },
    {
      from: "2015/03/29/englishman-in-new-york-czyli-jak",
      to: "/pl/englishman_in_new_york_czyli_net_w_mssql"
    },
    {
      from: "/2015/10/31/what-really-grind-my-gears-1",
      to: "/pl/what_really_grind_my_gears_if"
    },
    {
      from: "/2015/12/07/cierpienia-niemodego-bloggera-czyli",
      to: "/pl/cierpienia_niemlodego_bloggera"
    },
    {
      from: "/2016/01/06/nauka-uczenia-sie",
      to: "/pl/nauka_uczenia_sie"
    },
    {
      from: "/2017/01/06/metallica-skonczyla-sie-na-kill-em-all-a-ja-ide-w-open-sourcey",
      to: "/pl/metallica_skonczyla_sie_na_kill_em_all_a_ja_ide_w_open_sourcey"
    },
    {
      from: "/2017/11/05/co-gra-na-gitarze-moze-dac-programiscie",
      to: "/pl/o_tym_co_gra_na_gitarze_moze_dac_programiscie"
    },
    {
      from: "/2018/04/18/mezczyzna-w-it",
      to: "/pl/mezczyzna_w_IT"
    },
    {
      from: "/2019/11/30/zrodla-otwartosci",
      to: "/pl/zrodla_otwartosci"
    },
    {
      from: "/2020/02/16/relacja-z-domain-driven-design-europe-2020-cz-1-event-sourcing",
      to: "/pl/relacja_z_doman_driven_design_europe_2020"
    },
    {
      from: "/2020/10/01/jak-zaczac-z-open-source",
      to: "/pl/jak_zaczac_z_open_source"
    },
    {
      from: "/pl/how_to_configure_algolia_for_your_site",
      to: "/pl/how_to_configure_algolia_for_your_site_search"
    },
    {
      from: "/en/how_to_configure_algolia_for_your_site",
      to: "/en/how_to_configure_algolia_for_your_site_search"
    }
  ].forEach(r => {
    createRedirect({
      fromPath: r.from,
      toPath: r.to,
      isPermanent: true,
      redirectInBrowser: isEnvDevelopment,
      statusCode: 301
    });
  });
}

export const onPreBuild = ({ actions: { createRedirect } }, pluginOptions) => {
  const isEnvDevelopment = process.env.NODE_ENV === "development";
  const { notFoundPage } = { ...DEFAULT_OPTIONS, ...pluginOptions };

  // we add a generic redirect to the "not found path" for every path that's not present in the app.
  // This rule needs to be the last one (so that it only kicks in if nothing else matched before),
  // thus it's added after all the page-related hooks have finished (hence "onPreBuild")

  if (notFoundPage) {
    createRedirect({
      fromPath: "/*",
      toPath: notFoundPage,
      isPermanent: false,
      redirectInBrowser: isEnvDevelopment,
      statusCode: 302
    });
  }
};
