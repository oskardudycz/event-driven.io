import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../src/theme/tokens.css';
import '../../src/theme/tailwind.css';
import '../../src/theme/global.css';
import './gallery.css';
import { English, Polish } from './editorial.story.tsx';
import { HeroExample } from './hero.story.tsx';
import { GuideExample } from './guide.story.tsx';

// Manual preview only. Tests render the same scenarios through vitest-browser-react.
const parameters = new URL(location.href).searchParams;
const story = parameters.get('story') || 'Editorial/English';
const polish = story.endsWith('/Polish');
document.documentElement.lang = polish ? 'pl' : 'en';
document.documentElement.dataset.theme =
  parameters.get('theme') === 'dark' ? 'dark' : 'light';
for (const weight of [400, 600]) {
  const fonts = await document.fonts.load(`${weight} 1em "Open Sans"`);
  if (!fonts.length) throw new Error(`Open Sans ${weight} did not load`);
  document.documentElement.dataset[`font${weight}`] = 'loaded';
}
let example;
if (story.startsWith('Hero/')) {
  example = <HeroExample language={polish ? 'pl' : 'en'} />;
} else if (story.startsWith('Guides/')) {
  example = <GuideExample language={polish ? 'pl' : 'en'} />;
} else if (polish) {
  example = <Polish />;
} else {
  example = <English />;
}
createRoot(document.getElementById('root')!).render(example);
