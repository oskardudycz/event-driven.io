// Narrow contracts for untyped integrations; maintained @types packages cover the others.
declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown';
  export const gfm: TurndownService.Plugin;
}
declare module 'gatsby-remark-embed-video' {
  import type { Root } from 'mdast';
  type Options = {
    width?: number;
    height?: number;
    ratio?: number;
    related?: boolean;
    noIframeBorder?: boolean;
    loadingStrategy?: string;
    urlOverrides?: { id: string; embedURL: (id: string) => string }[];
  };
  function embedVideo(args: { markdownAST: Root }, options: Options): void;
  namespace embedVideo {
    function setParserPlugins(options: Options): unknown[];
  }
  export default embedVideo;
}
declare module 'gatsby-plugin-react-i18next/gatsby-node.js' {
  export interface LocalizedPage {
    path: string;
    context: Record<string, unknown>;
    matchPath?: string;
  }
  export function onCreatePage(
    args: {
      page: LocalizedPage;
      actions: {
        createPage(page: LocalizedPage): void;
        deletePage(page: LocalizedPage): void;
      };
    },
    options: Record<string, unknown>,
  ): Promise<void>;
}
declare module 'gatsby-plugin-netlify/constants.js' {
  export const DEFAULT_OPTIONS: Record<string, unknown>;
}
declare module 'gatsby-plugin-netlify/build-headers-program.js' {
  const module: {
    default: (
      args: {
        publicFolder(file: string): string;
        manifest: Record<string, string | string[]>;
        pages: { path: string }[];
        pathPrefix: string;
      },
      options: Record<string, unknown>,
      reporter: { warn(message: string): void },
    ) => Promise<void>;
  };
  export default module;
}
declare module 'gatsby-plugin-netlify/create-redirects.js' {
  import type { Actions } from 'gatsby';
  const module: {
    default: (
      args: { publicFolder(file: string): string },
      redirects: Parameters<Actions['createRedirect']>[0][],
      rewrites: unknown[],
    ) => Promise<void | null>;
  };
  export default module;
}
