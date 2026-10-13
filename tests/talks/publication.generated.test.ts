import { readFileSync } from 'node:fs';
import { load } from 'cheerio';
import { expect, test } from 'vitest';
import videoData from '../../data/videos.json' with { type: 'json' };

for (const language of ['en', 'pl']) {
  test(`${language} talks publish current video metadata in editorial order`, () => {
    const $ = load(readFileSync(`public/${language}/talks/index.html`, 'utf8'));
    const cards = $('.videoGrid > li').toArray();
    const expected = videoData.toSorted(
      (left, right) => left.Order - right.Order,
    );
    expect(cards).toHaveLength(expected.length);
    for (const [index, video] of expected.entries()) {
      const card = $(cards[index]);
      const link = card.find('h3 a');
      expect(link.text()).toBe(video.Title);
      expect(link.attr('href')).toBe(
        `https://www.youtube.com/watch?v=${video.VideoId}`,
      );
      expect(card.find('.videoDetails p').text()).toBe(
        `${video.Channel} · ${video.Duration} · ${video.Language}`,
      );
      expect(card.find('button').attr('aria-label')).toContain(video.Title);
    }
  });
}
