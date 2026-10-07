import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { normalizeYouTubeEmbeds, youtubeVideoUrl } from '../import/youtube-markdown.mts';

test('standalone links and thumbnails become video directives without rewriting prose or code', () => {
  const prose = 'A reference to [a song](https://youtu.be/0pYmuk0-N_4) inside a sentence.';
  const code = '```typescript\nconst url = "https://youtu.be/0pYmuk0-N_4";\n```';
  const existing = '`youtube: https://www.youtube.com/watch?v=20zvAJAhqS0`';
  const source = `${prose}\n\n[My talk](https://youtu.be/0pYmuk0-N_4?t=1m30s)\n\n[![Thumbnail](cover.png)](https://youtube.com/watch?v=20zvAJAhqS0)\n\n${code}\n\n${existing}\n`;
  const result = normalizeYouTubeEmbeds(source);
  assert.ok(result.includes(prose));
  assert.ok(result.includes(code));
  assert.ok(result.includes(existing));
  assert.ok(
    result.includes('`youtube: [My talk](https://www.youtube.com/watch?t=1m30s&v=0pYmuk0-N_4)`'),
  );
  assert.ok(result.includes('`youtube: [Thumbnail](https://www.youtube.com/watch?v=20zvAJAhqS0)`'));
  assert.equal(normalizeYouTubeEmbeds(result), result);
});

test('video URLs retain timestamps and playlists, reject non-video and lookalike domains', () => {
  assert.equal(
    youtubeVideoUrl('https://youtu.be/0pYmuk0-N_4#t=90'),
    'https://www.youtube.com/watch?v=0pYmuk0-N_4&t=90',
  );
  assert.equal(
    youtubeVideoUrl('https://www.youtube.com/shorts/0pYmuk0-N_4'),
    'https://www.youtube.com/watch?v=0pYmuk0-N_4',
  );
  assert.equal(
    youtubeVideoUrl('https://www.youtube.com/watch?v=0pYmuk0-N_4&list=playlist&start=30'),
    'https://www.youtube.com/watch?v=0pYmuk0-N_4&list=playlist&start=30',
  );
  for (const url of [
    'https://youtube.com/playlist?list=playlist',
    'https://youtube.com/@channel',
    'https://youtube.com.example.org/watch?v=0pYmuk0-N_4',
    'javascript:alert(1)',
    'https://youtu.be/bad',
  ])
    assert.equal(youtubeVideoUrl(url), undefined);
  assert.match(
    normalizeYouTubeEmbeds('["<unsafe>"](https://youtu.be/0pYmuk0-N_4)'),
    /&quot;&lt;unsafe&gt;&quot;/,
  );
});

test('all published Markdown uses embeds for standalone YouTube video links', () => {
  function files(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const file = join(directory, entry.name);
      return entry.isDirectory() ? files(file) : file.endsWith('.md') ? [file] : [];
    });
  }
  for (const file of files('content')) {
    const source = readFileSync(file, 'utf8');
    assert.equal(normalizeYouTubeEmbeds(source), source, file);
  }
});
