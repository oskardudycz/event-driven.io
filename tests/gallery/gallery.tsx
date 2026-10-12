import React, { type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import '../../src/theme/tokens.css';
import '../../src/theme/tailwind.css';
import '../../src/theme/global.css';
import './gallery.css';
import { English, Polish } from './editorial.story.tsx';

const stories: Record<string, ComponentType> = {
  'Editorial/English': English,
  'Editorial/Polish': Polish,
};
const root = createRoot(document.getElementById('root')!);

declare global {
  interface Window {
    mount: (_params: {
      story: string;
      props?: { theme?: string };
    }) => Promise<void>;
    unmount: () => void;
  }
}

window.mount = async ({ story, props }) => {
  const Story = stories[story];
  if (!Story) throw new Error(`Unknown component example: ${story}`);
  document.documentElement.lang = story.endsWith('Polish') ? 'pl' : 'en';
  document.documentElement.dataset.theme = props?.theme || 'light';
  for (const weight of [400, 600]) {
    const fonts = await document.fonts.load(`${weight} 1em "Open Sans"`);
    if (!fonts.length) throw new Error(`Open Sans ${weight} did not load`);
    document.documentElement.dataset[`font${weight}`] = 'loaded';
  }
  flushSync(() => root.render(<Story />));
};
window.unmount = () => flushSync(() => root.render(null));

const initialStory = new URL(location.href).searchParams.get('story');
if (initialStory) await window.mount({ story: initialStory });
