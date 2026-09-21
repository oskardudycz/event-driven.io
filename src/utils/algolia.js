module.exports = function(chunksTotal, { node }) {
  const {
    excerpt,
    fields: { slug, langKey, source, prefix },
    frontmatter: { title, category, useDefaultLangCanonical },
    internal: { content }
  } = node;

  if (useDefaultLangCanonical || !["posts", "pages", "newsletter-pl"].includes(source)) {
    return chunksTotal;
  }

  const path = `/${langKey}${slug}`;
  const searchableContent = content
    .replace(/<img class="emoji-icon".+?\/>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/```[^\n]*\n?/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const contentChunks = chunkString(searchableContent, 4500);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(prefix || "") ? prefix : "";
  const publishedAt = date ? Date.parse(`${date}T00:00:00Z`) / 1000 : 0;
  const record = {
    title,
    path,
    slug,
    langKey,
    source,
    category: category || "",
    date,
    publishedAt,
    excerpt: excerpt || ""
  };
  const recordChunks = contentChunks.reduce((recordChunksTotal, contentChunksItem, idx) => {
    return [
      ...recordChunksTotal,
      {
        ...record,
        content: contentChunksItem,
        objectID: `${path}#${idx}`
      }
    ];
  }, []);

  return [...chunksTotal, ...recordChunks];
};

function chunkString(str, length) {
  return str.match(new RegExp("(.|[\r\n]){1," + length + "}", "g")) || [""];
}
