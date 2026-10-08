require('dotenv').config();
const config = require('./content/meta/config');
module.exports = {
  trailingSlash: 'always',
  siteMetadata: {
    title: config.siteTitle,
    description: config.siteDescription,
    siteUrl: config.siteUrl,
    pathPrefix: config.pathPrefix,
    facebook: {
      appId: process.env.FB_APP_ID ? process.env.FB_APP_ID : '',
    },
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        cssLoaderOptions: {
          modules: {
            // css-loader 5's default MD4 hash is unavailable in Node 24.
            // Use its supported identifier template, preserving Gatsby's named exports.
            localIdentName: '[name]--[local]--[sha256:hash:hex:8]',
          },
        },
      },
    },
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/layouts/`),
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: { name: 'locale', path: `${__dirname}/src/i18n/locales/` },
    },
    {
      resolve: 'gatsby-plugin-react-i18next',
      options: {
        languages: ['en', 'pl'],
        defaultLanguage: 'en',
        generateDefaultLanguagePage: true,
        redirect: false,
        siteUrl: config.siteUrl,
        i18nextOptions: { interpolation: { escapeValue: false }, initImmediate: false },
        // Existing server redirects and editorial routes remain authoritative.
        // Recognize prefixed routes; leave unprefixed pages to the site hook.
        pages: [
          {
            matchPath: '/:lang(en|pl)?/:path*',
            getLanguageFromPath: true,
            excludeLanguages: ['en', 'pl'],
          },
        ],
      },
    },
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/data/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images/`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/posts/`,
        name: 'posts',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/newsletter-pl/`,
        name: 'newsletter-pl',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/pages/`,
        name: 'pages',
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `parts`,
        path: `${__dirname}/content/parts/`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: require.resolve('./plugins/gatsby-remark-video'),
            options: {
              width: 800,
              ratio: 1.77,
              height: 400,
              related: false,
              noIframeBorder: true,
              loadingStrategy: 'lazy',
              urlOverrides: [
                {
                  id: 'youtube',
                  embedURL: (id) => `https://www.youtube-nocookie.com/embed/${id}`,
                },
              ],
            },
          },
          `gatsby-plugin-sharp`,
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 800,
              withWebp: { quality: 80 },
              backgroundColor: 'transparent',
              wrapperStyle: 'height: auto',
              quality: 80,
            },
          },
          {
            resolve: require.resolve('./plugins/gatsby-remark-image-priority'),
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 2em`,
            },
          },
          `gatsby-remark-autolink-headers`,
          {
            resolve: `gatsby-remark-prismjs`,
            options: { aliases: { sh: 'bash', env: 'bash' } },
          },
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
          {
            resolve: 'gatsby-remark-emojis',
            options: {
              // Deactivate the plugin globally (default: true)
              active: true,
              // Add a custom css class
              class: 'emoji-icon',
              // Select the size (available size: 16, 24, 32, 64)
              size: 64,
              // Add custom styles
              styles: {
                display: 'inline',
                margin: '0',
                'margin-top': '1px',
                position: 'relative',
                top: '5px',
                width: '25px',
              },
            },
          },
          '@weknow/gatsby-remark-twitter',
        ],
      },
    },
    `gatsby-plugin-image`,
    `gatsby-plugin-sharp`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-catch-links`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: config.manifestName,
        short_name: config.manifestShortName,
        start_url: config.manifestStartUrl,
        background_color: config.manifestBackgroundColor,
        theme_color: config.manifestThemeColor,
        display: config.manifestDisplay,
        icons: [
          {
            src: '/icons/favicon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: '/icons/favicon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/favicon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/favicon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/favicon-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: '/icons/favicon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/favicon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    },
    //`gatsby-plugin-offline`,
    `gatsby-plugin-remove-serviceworker`,
    {
      resolve: 'gatsby-plugin-google-tagmanager',
      options: {
        id: process.env.GOOGLE_TAG_ID,

        // Include GTM in development.
        //
        // Defaults to false meaning GTM will only be loaded in production.
        includeInDevelopment: false,

        // datalayer to be set before GTM is loaded
        // should be an object or a function that is executed in the browser
        //
        // Defaults to null
        defaultDataLayer: { platform: 'gatsby' },

        // // Specify optional GTM environment details.
        // gtmAuth: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_AUTH_STRING",
        // gtmPreview: "YOUR_GOOGLE_TAGMANAGER_ENVIRONMENT_PREVIEW_NAME",
        // dataLayerName: "YOUR_DATA_LAYER_NAME",

        // // Name of the event that is triggered
        // // on every Gatsby route change.
        // //
        // // Defaults to gatsby-route-change
        // routeChangeEventName: "YOUR_ROUTE_CHANGE_EVENT_NAME",
      },
    },
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            title: `${config.siteTitle} — articles`,
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  url: `${site.siteMetadata.siteUrl}/${edge.node.fields.langKey}${edge.node.fields.slug}`,
                  guid: `${site.siteMetadata.siteUrl}/${edge.node.fields.langKey}${edge.node.fields.originalSlug || edge.node.fields.slug}`,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  limit: 1000,
                  sort: { fields: { prefix: DESC } },
                  filter: { fileAbsolutePath: { regex: "//posts/[0-9]+.*--/" }, fields: { slug: { ne: null }, langKey: { eq: "en" } } }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields {
                        slug
                        originalSlug
                        prefix
                        langKey
                      }
                      frontmatter {
                        title
                      }
                    }
                  }
                }
              }
            `,
            output: '/rss.xml',
          },

          {
            title: `${config.siteTitle} — Architecture Weekly archive`,
            serialize: ({ query: { site, allMarkdownRemark } }) => {
              return allMarkdownRemark.edges.map((edge) => {
                return Object.assign({}, edge.node.frontmatter, {
                  description: edge.node.excerpt,
                  url: `${site.siteMetadata.siteUrl}/${edge.node.fields.langKey}${edge.node.fields.slug}`,
                  guid: `${site.siteMetadata.siteUrl}/${edge.node.fields.langKey}${edge.node.fields.originalSlug || edge.node.fields.slug}`,
                  custom_elements: [{ 'content:encoded': edge.node.html }],
                });
              });
            },
            query: `
              {
                allMarkdownRemark(
                  limit: 1000,
                  sort: { fields: { prefix: DESC } },
                  filter: { fileAbsolutePath: { regex: "//newsletter-pl/[0-9]+.*--/" }, fields: { slug: { ne: null }, langKey: { eq: "en" } } }
                ) {
                  edges {
                    node {
                      excerpt
                      html
                      fields {
                        slug
                        originalSlug
                        prefix
                        langKey
                      }
                      frontmatter {
                        title
                      }
                    }
                  }
                }
              }
            `,
            output: '/newsletter-pl-rss.xml',
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        output: `/sitemap`,
        query: `
          {
            site {
              siteMetadata {
                siteUrl
              }
            }
            allSitePage {
              nodes {
                path
                pageContext
              }
            }
          }
        `,
        resolvePages: ({ allSitePage }) =>
          allSitePage.nodes.filter(
            (page) => !(page.pageContext && page.pageContext.excludeFromSitemap),
          ),
        excludes: [
          `/en/404/`,
          `/pl/404/`,
          `/en/404.html`,
          `/pl/404.html`,
          `/**/search/`,
          `/**/success/`,
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
      options: {
        include: /svg-icons/,
      },
    },
    {
      resolve: `gatsby-plugin-netlify`,
      options: {
        // Explicit localized error rewrites preserve the 404 status.
        generateMatchPathRewrites: false,
        headers: {
          // YouTube requires a Referer; Netlify's default same-origin suppresses it.
          '/*': ['Referrer-Policy: strict-origin-when-cross-origin'],
          '/llms.txt': [
            'Content-Type: text/plain; charset=UTF-8',
            'Cache-Control: public, max-age=3600',
          ],
        },
      },
    },
  ],
};
