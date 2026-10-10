import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  normalizeYouTubeEmbeds,
  youtubeVideoUrl,
} from '../import/youtube-markdown.ts';

void test('only linked thumbnails become players; text links keep their exact Markdown', () => {
  const prose =
    'A reference to [a song](https://youtu.be/0pYmuk0-N_4) inside a sentence.';
  const code =
    '```typescript\nconst url = "https://youtu.be/0pYmuk0-N_4";\n```';
  const existing = '`youtube: https://www.youtube.com/watch?v=20zvAJAhqS0`';
  const textLinks = [
    '[My talk](https://youtu.be/0pYmuk0-N_4?t=1m30s)',
    '- [Heather Wilde - How to Close the Diversity Gap](https://www.youtube.com/watch?v=JQL4doMy73w)',
    '1. [A talk](https://youtu.be/0pYmuk0-N_4),',
    '- References:\n  - [Nested talk](https://youtu.be/0pYmuk0-N_4)',
    '**[Bold link](https://youtu.be/0pYmuk0-N_4)**',
    'https://www.youtube.com/watch?v=20zvAJAhqS0',
    '<https://www.youtube.com/watch?v=20zvAJAhqS0>',
    "[Somebody's Gotta Do It](https://www.youtube.com/watch?v=M0SjU95U3-k).",
  ];
  const source = `${prose}\n\n${textLinks.join('\n\n')}\n\n[![Thumbnail](cover.png)](https://youtube.com/watch?v=20zvAJAhqS0&start=30)\n\n${code}\n\n${existing}\n`;
  const result = normalizeYouTubeEmbeds(source);
  assert.ok(result.includes(prose));
  assert.ok(result.includes(code));
  assert.ok(result.includes(existing));
  for (const link of textLinks) assert.ok(result.includes(link), link);
  assert.ok(
    result.includes(
      '`youtube: [Thumbnail](https://www.youtube.com/watch?v=20zvAJAhqS0&start=30)`',
    ),
  );
  assert.equal(normalizeYouTubeEmbeds(result), result);
});

void test('video URLs retain timestamps and playlists, reject non-video and lookalike domains', () => {
  assert.equal(
    youtubeVideoUrl('https://youtu.be/0pYmuk0-N_4#t=90'),
    'https://www.youtube.com/watch?v=0pYmuk0-N_4&t=90',
  );
  assert.equal(
    youtubeVideoUrl('https://www.youtube.com/shorts/0pYmuk0-N_4'),
    'https://www.youtube.com/watch?v=0pYmuk0-N_4',
  );
  assert.equal(
    youtubeVideoUrl(
      'https://www.youtube.com/watch?v=0pYmuk0-N_4&list=playlist&start=30',
    ),
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
    normalizeYouTubeEmbeds(
      '[!["<unsafe>"](cover.png)](https://youtu.be/0pYmuk0-N_4)',
    ),
    /&quot;&lt;unsafe&gt;&quot;/,
  );
});
