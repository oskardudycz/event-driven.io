declare module 'turndown-plugin-gfm' {
  import type TurndownService from 'turndown';
  export const gfm: TurndownService.Plugin;
}
declare module 'underscore.string/prune.js' {
  export default function prune(
    text: string,
    length: number,
    omission?: string,
  ): string;
}
declare module 'github-slugger' {
  export default function slugger(): {
    slug(value: string, maintainCase?: boolean): string;
    reset(): void;
  };
}
declare module 'retext' {
  export default function retext(): {
    use(plugin: unknown): {
      processSync(value: string): { toString(): string };
    };
  };
}
declare module 'retext-smartypants' {
  const plugin: unknown;
  export default plugin;
}
declare module 'parse-numeric-range' {
  export default function range(value: string): number[];
}
