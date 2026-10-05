export function searchableText(raw) {
  return (raw || '')
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/<(script|style|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(
      /<\/?(?:p|div|span|em|strong|a|img|br|figure|figcaption|details|summary|h[1-6])\b[^>]*>/gi,
      ' ',
    )
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/```[^\n]*\n?/g, '')
    .replace(/[*`~]/g, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
export function searchDocuments(nodes, language, defaultLanguage = 'en') {
  const groups = new Map();
  for (const node of nodes) {
    const { fields, frontmatter } = node;
    if (
      !fields?.slug ||
      !frontmatter?.title ||
      frontmatter.useDefaultLangCanonical ||
      !['posts', 'pages', 'newsletter-pl'].includes(fields.source)
    )
      continue;
    // Search is a public discovery index: utility/auth routes stay excluded.
    if (
      fields.source === 'pages' &&
      /^\/(?:search|404|signin|callback|billing)\//.test(fields.slug)
    )
      continue;
    const key = `${fields.source}:${fields.slug}`;
    const versions = groups.get(key) || [];
    versions.push(node);
    groups.set(key, versions);
  }
  return [...groups]
    .map(([id, versions]) => {
      const node =
        versions.find((node) => node.fields.langKey === language) ||
        versions.find((node) => node.fields.langKey === defaultLanguage) ||
        versions[0];
      const { fields, frontmatter } = node;
      return {
        id,
        title: frontmatter.title,
        path: `/${fields.langKey}${fields.slug}`,
        langKey: fields.langKey,
        source: fields.source,
        category: [
          ...new Set([frontmatter.category, ...(frontmatter.categories || [])].filter(Boolean)),
        ].join(' · '),
        date: /^\d{4}-\d{2}-\d{2}$/.test(fields.prefix || '') ? fields.prefix : '',
        content: searchableText(node.rawMarkdownBody || node.internal?.content),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}
