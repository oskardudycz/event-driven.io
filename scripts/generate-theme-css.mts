import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';
import { format } from 'prettier';

// Framework-independent output: Gatsby and Astro can import the same stylesheet.
const source = new URL('../src/theme/theme.yaml', import.meta.url);
const destination = new URL('../src/theme/tokens.css', import.meta.url);
const theme: unknown = yaml.load(readFileSync(source, 'utf8'));
const properties: Record<string, string> = {
  'color-surface': 'background.color.primary',
  'color-text': 'text.color.primary',
  'color-text-muted': 'color.neutral.gray.h',
  'space-xxs': 'space.xxs',
  'space-xs': 'space.xs',
  'space-sm': 'space.s',
  'space-md': 'space.m',
  'space-lg': 'space.l',
  'font-size-small': 'font.size.xxs',
  'font-size-summary': 'font.size.m',
  'line-height-summary': 'font.lineHeight.l',
  'color-date': 'color.neutral.gray.g',
  'color-border': 'line.color',
  'color-attention': 'color.special.attention',
  'color-brand': 'color.brand.primary',
  'color-text-inverse': 'text.color.primaryInverse',
  'space-default': 'space.default',
  'space-stack-md': 'space.stack.m',
  'space-stack-lg': 'space.stack.l',
  'space-inline-md': 'space.inline.m',
  'space-inline-sm': 'space.inline.s',
  'font-size-heading': 'font.size.l',
  'font-size-body-large': 'font.size.s',
  'font-size-caption': 'font.size.xs',
  'line-height-heading': 'font.lineHeight.s',
  'line-height-card': 'font.lineHeight.m',
  'font-weight-bold': 'font.weight.bold',
  'radius-card': 'size.radius.default',
  'duration-default': 'time.duration.default',
};

const declarations = Object.entries(properties).map(([name, path]) => {
  let value = theme;
  for (const key of path.split('.')) {
    if (!value || typeof value !== 'object' || !(key in value)) {
      throw new Error(`Missing theme value: ${path}`);
    }
    value = (value as Record<string, unknown>)[key];
  }
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`Invalid theme value: ${path}`);
  }
  return `  --${name}: ${value};`;
});
const css = await format(
  `/* Generated from theme.yaml by yarn generate-theme-css. */\n:root {\n${declarations.join('\n')}\n}\n`,
  { parser: 'css' },
);
if (!existsSync(destination) || readFileSync(destination, 'utf8') !== css) {
  writeFileSync(destination, css);
}
