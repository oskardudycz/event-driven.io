import React, { useEffect, useMemo, useState } from 'react';
import { withPrefix } from 'gatsby';
import Hit from './Hit';
import { usePageContext } from '../../i18n/page-context';

const Search = () => {
  const { lang = 'en' } = usePageContext();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loaded, setLoaded] = useState(null);
  const [status, setStatus] = useState('idle');
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(0);
  const copy =
    lang === 'pl'
      ? {
          prompt: 'Wpisz wyszukiwaną frazę.',
          empty: 'Nie znaleziono pasujących wyników.',
          loading: 'Ładowanie wyszukiwarki…',
          error: 'Nie udało się załadować wyszukiwarki.',
          retry: 'Spróbuj ponownie',
          clear: 'Wyczyść',
          search: 'Szukaj',
          previous: 'Poprzednia',
          next: 'Następna',
          navigation: 'Strony wyników',
          stats: (count) => `${count} ${count === 1 ? 'wynik' : 'wyników'}`,
        }
      : {
          prompt: 'Start typing to search.',
          empty: 'No matching results found.',
          loading: 'Loading search…',
          error: 'Search could not be loaded.',
          retry: 'Try again',
          clear: 'Clear',
          search: 'Search',
          previous: 'Previous',
          next: 'Next',
          navigation: 'Search result pages',
          stats: (count) => `${count} ${count === 1 ? 'result' : 'results'}`,
        };
  const requested = Boolean(query.trim());
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 150);
    return () => clearTimeout(timer);
  }, [query]);
  useEffect(() => {
    if (!requested || loaded?.lang === lang) return;
    const controller = new AbortController();
    let active = true;
    setStatus('loading');
    const fetchText = async (url) => {
      const response = await fetch(withPrefix(url), {
        signal: controller.signal,
        cache: 'no-cache',
      });
      if (!response.ok) throw new Error('Search index unavailable');
      return response.text();
    };
    Promise.all([
      import(/* webpackChunkName: "local-search-engine" */ '../../search/runtime.mjs'),
      fetchText('/search-index/manifest.json').then(async (text) => {
        const url = JSON.parse(text)[lang];
        if (typeof url !== 'string' || !/^\/search-index\/(en|pl)\.[a-f0-9]+\.json$/.test(url))
          throw new Error('Invalid search manifest');
        return fetchText(url);
      }),
    ])
      .then(async ([runtime, json]) => {
        const index = await runtime.loadIndex(json);
        if (active) {
          setLoaded({ lang, index, search: runtime.searchIndex });
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) setStatus('error');
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [lang, requested, retry, loaded]);
  const results = useMemo(
    () => (loaded?.lang === lang && debounced ? loaded.search(loaded.index, debounced) : []),
    [loaded, lang, debounced],
  );
  const pages = Math.ceil(results.length / 10);
  const currentPage = Math.min(page, Math.max(0, pages - 1));
  const updateQuery = (value) => {
    setQuery(value);
    setPage(0);
  };
  return (
    <React.Fragment>
      <div className="search">
        <div className="ais-SearchBox">
          <form
            className="ais-SearchBox-form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              className="ais-SearchBox-input"
              type="search"
              aria-label={copy.search}
              placeholder={copy.search}
              maxLength={160}
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
            <button
              className="ais-SearchBox-reset"
              type="button"
              aria-label={copy.clear}
              onClick={() => updateQuery('')}
            >
              ×
            </button>
          </form>
        </div>
        <div role="status" aria-live="polite">
          {!requested ? (
            <p className="search-message">{copy.prompt}</p>
          ) : status === 'error' ? (
            <p className="search-message">
              {copy.error}{' '}
              <button type="button" onClick={() => setRetry((value) => value + 1)}>
                {copy.retry}
              </button>
            </p>
          ) : loaded?.lang !== lang ? (
            <p className="search-message">{copy.loading}</p>
          ) : results.length === 0 ? (
            <p className="search-message">{copy.empty}</p>
          ) : (
            <span className="ais-Stats">{copy.stats(results.length)}</span>
          )}
        </div>
        {requested && loaded?.lang === lang && results.length > 0 && (
          <>
            <ul className="ais-Hits-list">
              {results.slice(currentPage * 10, currentPage * 10 + 10).map((hit) => (
                <li className="ais-Hits-item" key={hit.id}>
                  <Hit hit={hit} />
                </li>
              ))}
            </ul>
            {pages > 1 && (
              <nav aria-label={copy.navigation}>
                <ul className="ais-Pagination-list">
                  <li>
                    <button
                      type="button"
                      disabled={currentPage === 0}
                      onClick={() => setPage(currentPage - 1)}
                    >
                      {copy.previous}
                    </button>
                  </li>
                  {Array.from({ length: pages }, (_, index) => index)
                    .filter(
                      (index) =>
                        index === 0 || index === pages - 1 || Math.abs(index - currentPage) <= 2,
                    )
                    .map((index) => (
                      <li key={index}>
                        <button
                          type="button"
                          aria-label={`${copy.navigation}: ${index + 1}`}
                          aria-current={index === currentPage ? 'page' : undefined}
                          onClick={() => setPage(index)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                  <li>
                    <button
                      type="button"
                      disabled={currentPage === pages - 1}
                      onClick={() => setPage(currentPage + 1)}
                    >
                      {copy.next}
                    </button>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>
      {/* --- STYLES --- */}
      <style jsx global>{`
        .ais-Pagination-list button {
          background: none;
          border: none;
          cursor: pointer;
        }
        .ais-Pagination-list button:disabled {
          opacity: 0.5;
          cursor: default;
        }
        .ais-SearchBox {
          width: 100%;
        }
        .ais-SearchBox-form {
          position: relative;
          border-bottom: 1px solid #aaa;
          display: flex;
          justify-content: space-between;
        }
        .ais-SearchBox-input {
          min-width: 0;
          width: 100%;
          border: none;
          padding: 0.2em;
          font-size: 1.4em;
          flex-grow: 1;
        }
        .ais-SearchBox-submit,
        .ais-SearchBox-reset {
          background: none;
          border: none;
          fill: #666;
          flex-grow: 0;
        }
        .ais-Stats {
          margin: 0.5em 0 2em 0.3em;
          font-size: 0.9em;
          color: #999;
          display: block;
        }
        .search-message {
          margin: 1.5em 0 0.5em;
          color: #777;
        }
        .ais-Hits-list {
          list-style: none;
          padding: 0;
        }
        .ais-Pagination-list {
          display: flex;
          list-style: none;
          justify-content: center;
          padding: 0;
        }
        .ais-Pagination-list button {
          color: #666;
          font-size: 1.2em;
          display: block;
          padding: 0.5em 0.5em 2em;
        }
        .ais-Pagination-list button:hover {
          color: red;
        }
        .ais-Pagination-item.ais-Pagination-item--firstPage a,
        .ais-Pagination-item.ais-Pagination-item--previousPage a,
        .ais-Pagination-item.ais-Pagination-item--nextPage a {
          padding: 0.4em 0.5em 0.6em;
        }
      `}</style>
    </React.Fragment>
  );
};

export default Search;
