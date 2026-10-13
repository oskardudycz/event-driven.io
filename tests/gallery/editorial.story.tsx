import React from 'react';
import AuthorView from '../../src/components/Post/AuthorView.tsx';
import ArchiveCard from '../../src/components/Blog/ArchiveCard.tsx';
import ReadingList from '../../src/components/List/ReadingList.tsx';
import SearchResult from '../../src/components/Search/SearchResult.tsx';
const cover = new URL('./cover.svg', import.meta.url).href;

const examples = {
  en: {
    title: 'Building reliable event-driven systems',
    longerTitle:
      'Keeping asynchronous workflows understandable as the system grows',
    excerpt:
      'A practical guide to event sourcing, clear boundaries and reliable asynchronous workflows. Start with a small model and make the trade-offs explicit.',
    note: '<p><strong>Example author</strong> shares practical experience with Event Sourcing, CQRS and software architecture. Explore <a href="/en/training/">training and workshops</a>, or <a href="/en/consulting/">discuss consulting</a>.</p>',
  },
  pl: {
    title: 'Niezawodne systemy zdarzeniowe: żółć, ą, ę, ś, ć',
    longerTitle:
      'Jak zachować czytelność asynchronicznych procesów wraz ze wzrostem złożoności systemu',
    excerpt:
      'Praktyczny przewodnik po Event Sourcingu, granicach odpowiedzialności i niezawodnych procesach. Zacznij od małego modelu i wyjaśnij podejmowane decyzje.',
    note: '<p><strong>Przykładowy autor</strong> dzieli się doświadczeniem z Event Sourcingiem, CQRS i architekturą oprogramowania. Sprawdź <a href="/pl/training/">szkolenia i warsztaty</a> lub <a href="/pl/consulting/">porozmawiaj o konsultacjach</a>. Zażółć gęślą jaźń.</p>',
  },
};

function Editorial({ language }: { language: 'en' | 'pl' }) {
  const example = examples[language];
  const href = `/${language}/example/`;
  return (
    <main className="specimens">
      <section aria-label="Author">
        <AuthorView
          note={example.note}
          avatar="/images/avatar.webp"
          name="Example author"
        />
      </section>
      <section aria-label="Archive">
        <ul className="archive">
          <ArchiveCard
            href={href}
            title={example.title}
            date="2026-01-15"
            author="Example author"
            tags={['Event Sourcing', 'Software Architecture']}
            excerpt={example.excerpt}
            cover={
              <img src={cover} alt={example.title} width="840" height="378" />
            }
          />
        </ul>
      </section>
      <section aria-label="Related">
        <ReadingList
          showImages
          items={[
            {
              id: 'short',
              href,
              title: example.title,
              date: '2026-01-15',
              excerpt: example.excerpt,
              image: { src: cover },
            },
            {
              id: 'long',
              href: `/${language}/long-title/`,
              title: example.longerTitle,
              date: '2026-01-16',
              excerpt: example.excerpt,
              image: { src: cover },
            },
          ]}
        />
      </section>
      <section aria-label="Search">
        <SearchResult
          lang={language}
          hit={{
            path: href,
            title: example.title,
            content: example.excerpt,
            date: '2026-01-15',
            source: 'posts',
            tags: 'Event Sourcing',
            langKey: 'en',
            terms: ['event'],
          }}
          cover={
            <img
              src={cover}
              alt=""
              width="840"
              height="378"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          }
        />
      </section>
    </main>
  );
}

export const English = () => <Editorial language="en" />;
export const Polish = () => <Editorial language="pl" />;
