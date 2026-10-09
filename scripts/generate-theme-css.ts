import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';
import { format, resolveConfig } from 'prettier';
import { fileURLToPath } from 'node:url';

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
  'color-brand-tint': 'color.brand.primary',
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
  'font-line-height-xl': 'font.lineHeight.xl',
  'header-height-default': 'header.height.default',
  'space-inset-default': 'space.inset.default',
  'font-size-xxl': 'font.size.xxl',
  'text-max-width-tablet': 'text.maxWidth.tablet',
  'text-max-width-desktop': 'text.maxWidth.desktop',
  'space-xl': 'space.xl',
  'background-color-alt': 'background.color.alt',
  'font-size-xl': 'font.size.xl',
  'time-duration-long': 'time.duration.long',
  'font-line-height-xxl': 'font.lineHeight.xxl',
  'text-color-brand': 'text.color.brand',
  'font-weight-standard': 'font.weight.standard',
  'space-stack-xs': 'space.stack.xs',
  'size-radius-small': 'size.radius.small',
  'space-inset-s': 'space.inset.s',
  'blog-h1-line-height': 'blog.h1.lineHeight',
  'blog-h1-size': 'blog.h1.size',
  'icon-color': 'icon.color',
  'space-inline-xs': 'space.inline.xs',
  'blog-h1-hover-color': 'blog.h1.hoverColor',
  'color-neutral-white': 'color.neutral.white',
  'header-height-homepage': 'header.height.homepage',
  'space-inline-default': 'space.inline.default',
  'space-inset-l': 'space.inset.l',
  'color-neutral-gray-d': 'color.neutral.gray.d',
  'header-height-fixed': 'header.height.fixed',
  'space-stack-xxs': 'space.stack.xxs',
  'hero-background': 'hero.background',
  'hero-h1-size': 'hero.h1.size',
  'hero-h1-color': 'hero.h1.color',
  'hero-h1-line-height': 'hero.h1.lineHeight',
  'text-color-attention': 'text.color.attention',
  'color-neutral-gray-k': 'color.neutral.gray.k',
  'hero-h2-size': 'hero.h2.size',
  'hero-h2-color': 'hero.h2.color',
  'hero-h2-line-height': 'hero.h2.lineHeight',
  'hero-h3-size': 'hero.h3.size',
  'hero-h3-color': 'hero.h3.color',
  'hero-h3-line-height': 'hero.h3.lineHeight',
  'color-neutral-black': 'color.neutral.black',
  'space-inset-xs': 'space.inset.xs',
  'color-brand-primary-dark': 'color.brand.primaryDark',
  'space-inset-m': 'space.inset.m',
  'color-neutral-gray-f': 'color.neutral.gray.f',
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
  if (name === 'color-brand-tint') {
    if (!/^#[a-f0-9]{6}$/i.test(String(value)))
      throw new Error('Brand tint needs a six-digit hex color');
    value = `${value}18`;
  }
  return `  --${name}: ${String(value).replace(/;+$/, '')};`;
});
const css = await format(
  `/* Generated from theme.yaml by yarn generate-theme-css. */\n:root {\n${declarations.join('\n')}\n}\n`,
  { ...(await resolveConfig(fileURLToPath(destination))), parser: 'css' },
);
if (!existsSync(destination) || readFileSync(destination, 'utf8') !== css) {
  writeFileSync(destination, css);
}
