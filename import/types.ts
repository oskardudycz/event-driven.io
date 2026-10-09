export type ImportEntry = {
  url: string;
  slug?: string;
  category?: string;
  codeLanguage?: string;
  imageAlts?: Record<string, unknown>;
  youtubeVideo?: string;
  recordingEmbeds?: Record<string, string>;
};
export type Download = (url: string) => Promise<Pick<Response, 'text' | 'arrayBuffer'>>;
export type ImportOptions = {
  download?: Download;
  html?: string;
  output?: string;
  links?: Map<string, string>;
};
