export function localizedHref(href: string, language: string) {
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|[?#])/i.test(href)) return href;
  if (/^\/(?:en|pl)(?:[/?#]|$)/i.test(href)) return href;
  return `/${language}${href.startsWith('/') ? href : `/${href}`}`;
}
