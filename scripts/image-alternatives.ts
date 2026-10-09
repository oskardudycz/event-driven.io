import cheerio from 'cheerio';
import remark from 'remark';
import yaml from 'js-yaml';
import visit from 'unist-util-visit';
import type { Root, Image, ImageReference, Definition, Html } from 'mdast';

export type ImageIssue = { line: number; url: string; message: string };
export function imageIssues(markdown: string): ImageIssue[] {
  const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const metadata = frontmatter
    ? (yaml.load(frontmatter[1]) as { decorativeImages?: string[] })
    : {};
  const decorative = metadata?.decorativeImages || [];
  if (!Array.isArray(decorative) || decorative.some((value) => typeof value !== 'string'))
    throw new Error('decorativeImages must be a list of image paths');
  const body = frontmatter ? markdown.slice(frontmatter[0].length) : markdown;
  const offset = frontmatter ? frontmatter[0].split('\n').length - 1 : 0;
  const tree = remark().parse(body) as Root;
  const definitions = new Map<string, string>();
  const issues: ImageIssue[] = [];
  visit(tree, 'definition', (node: Definition) => {
    definitions.set(node.identifier, node.url);
  });
  visit(tree, ['image', 'imageReference', 'html'], (node: Image | ImageReference | Html) => {
    const line = (node.position?.start.line || 1) + offset;
    if (node.type === 'image' || node.type === 'imageReference') {
      const url = node.type === 'image' ? node.url : definitions.get(node.identifier);
      if (!url) issues.push({ line, url: '', message: 'Unresolved image reference' });
      else if (!node.alt?.trim() && !decorative.includes(url))
        issues.push({
          line,
          url,
          message:
            'Describe this image, or explicitly list its path in decorativeImages frontmatter',
        });
    } else if (node.type === 'html') {
      const $ = cheerio.load(node.value, null, false);
      $('img').each((_, image) => {
        if (!Object.hasOwn(image.attribs, 'alt'))
          issues.push({
            line,
            url: $(image).attr('src') || '',
            message: 'HTML images require an explicit alt attribute (empty only when decorative)',
          });
      });
    }
  });
  return issues;
}

export function importedAlternative(sourceAlt: string | undefined, override: unknown, url: string) {
  if (override !== undefined && typeof override !== 'string')
    throw new Error(`imageAlts values must be strings: ${url}`);
  const alt = override === undefined ? sourceAlt?.trim() : override.trim();
  if (alt === undefined || (!alt && override === undefined))
    throw new Error(
      `Image needs a description: ${url}. Add imageAlts[URL] to the import manifest; use an empty string only for a decorative image.`,
    );
  return { alt, decorative: alt === '' };
}
