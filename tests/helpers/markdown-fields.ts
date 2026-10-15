// Fields that Gatsby's onCreateNode gives a Markdown file from a content source.
export async function markdownFields(
  sourceInstanceName: string,
  relativePath: string,
) {
  const { onCreateNode } = await import('../../site/node.ts');
  const file = {
    id: 'file',
    internal: { type: 'File' },
    sourceInstanceName,
    relativePath,
  };
  const markdown = {
    id: 'markdown',
    parent: 'file',
    internal: { type: 'MarkdownRemark' },
  };
  const fields: Record<string, string> = {};
  await onCreateNode(
    {
      node: markdown,
      getNode: (id: string) => (id === 'file' ? file : undefined),
      actions: {
        createNodeField: ({ name, value }: { name: string; value: string }) => {
          fields[name] = value;
        },
      },
    } as unknown as Parameters<typeof onCreateNode>[0],
    { plugins: [] },
    () => {},
  );
  return fields;
}
