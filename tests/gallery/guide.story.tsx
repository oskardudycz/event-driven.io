import React from 'react';
import Headline from '../../src/components/Article/Headline.tsx';
import Bodytext from '../../src/components/Article/Bodytext.tsx';
import ReadingList from '../../src/components/List/ReadingList.tsx';

const cover = new URL('./cover.svg', import.meta.url).href;

export function GuideExample({ language }: { language: 'en' | 'pl' }) {
  const polish = language === 'pl';
  const title = polish
    ? 'Zdarzenia wewnętrzne i zdarzenia na zewnątrz'
    : 'Events on the inside, events on the outside';
  const introduction = polish
    ? 'Gdy inny zespół potrzebuje Twoich danych, warto najpierw ustalić, co powinien wiedzieć o zmianach. Rozdziel szczegóły wewnętrznego modelu od informacji potrzebnych odbiorcom.'
    : 'When another team needs your data, start by deciding what they need to know about changes. Separate the details of your internal model from the information consumers need.';
  return (
    <main className="specimens">
      <Headline>
        <span aria-hidden="true">🧱</span> {title}
      </Headline>
      <Bodytext html={`<p>${introduction}</p>`} />
      <ReadingList
        ordered
        showImages
        items={[
          {
            id: 'events',
            href: `/${language}/events_on_the_outside_vs_inside/`,
            title,
            date: '2026-01-15',
            excerpt: introduction,
            image: { src: cover },
          },
        ]}
      />
    </main>
  );
}
