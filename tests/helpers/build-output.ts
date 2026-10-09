import type { PageData, SitePageContext } from '../../src/types/content.ts';

// Gatsby's page-data envelope. Each check still verifies the queried fields it uses.
export type BuildPageData = {
  path: string;
  result: {
    data: PageData & {
      locales: {
        edges: { node: { language: string; ns: string; data: string } }[];
      };
    };
    pageContext: SitePageContext & {
      langKey: string;
      language: string;
      relatedIds: string[];
      i18n: {
        language: string;
        generateDefaultLanguagePage: boolean;
        routed: boolean;
        originalPath: string;
      };
    };
  };
};
