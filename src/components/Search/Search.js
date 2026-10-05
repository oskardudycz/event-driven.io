import React, { useEffect, useMemo, useRef, useState } from 'react';
import { withPrefix } from 'gatsby';
import Hit from './Hit';
import PropTypes from 'prop-types';
import { FaSearch } from 'react-icons/fa';
import { usePageContext } from '../../i18n/page-context';

const Search = ({ theme }) => {
  const { lang = 'en' } = usePageContext();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loaded, setLoaded] = useState(null);
  const [status, setStatus] = useState('idle');
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(0);
  const resultsList = useRef(null);
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
  const goToPage = (page) => {
    setPage(page);
    resultsList.current?.scrollIntoView({ block: 'start' });
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
            <FaSearch className="search-input-icon" aria-hidden="true" />
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
              hidden={!query}
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
            <ul className="ais-Hits-list" ref={resultsList}>
              {results.slice(currentPage * 10, currentPage * 10 + 10).map((hit) => (
                <li className="ais-Hits-item" key={hit.id}>
                  <Hit hit={hit} theme={theme} />
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
                      onClick={() => goToPage(currentPage - 1)}
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
                          onClick={() => goToPage(index)}
                        >
                          {index + 1}
                        </button>
                      </li>
                    ))}
                  <li>
                    <button
                      type="button"
                      disabled={currentPage === pages - 1}
                      onClick={() => goToPage(currentPage + 1)}
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
        .search .ais-SearchBox-form {
          display: flex;
          align-items: center;
          gap: ${theme.space.s};
          padding: ${theme.space.s} ${theme.space.m};
          border: 1px solid ${theme.color.neutral.gray.f};
          border-radius: ${theme.size.radius.default};
          background: ${theme.background.color.primary};
        }
        .search .ais-SearchBox-form:focus-within {
          border-color: ${theme.text.color.brand};
          outline: 2px solid ${theme.text.color.brand};
          outline-offset: 2px;
        }
        .search .search-input-icon {
          color: ${theme.text.color.brand};
          flex-shrink: 0;
        }
        .search .ais-SearchBox-input {
          min-width: 0;
          width: 100%;
          border: none;
          outline: none;
          padding: ${theme.space.xs} 0;
          font-family: inherit;
          color: ${theme.text.color.primary};
          background: transparent;
          font-size: 1.1em;
          flex: 1;
        }
        .search .ais-SearchBox-input::placeholder {
          color: ${theme.color.neutral.gray.h};
        }
        .search .ais-SearchBox-reset {
          border: none;
          border-radius: ${theme.size.radius.small};
          background: none;
          color: ${theme.text.color.brand};
          font-size: 1.4em;
          min-width: 44px;
          min-height: 44px;
          cursor: pointer;
        }
        .search .ais-Stats,
        .search .search-message {
          margin: ${theme.space.m} 0;
          font-size: 0.9em;
          color: ${theme.color.neutral.gray.h};
          display: block;
        }
        .search .ais-Hits-list {
          scroll-margin-top: 100px;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .search .ais-Pagination-list {
          display: flex;
          flex-wrap: wrap;
          gap: ${theme.space.xs};
          list-style: none;
          justify-content: center;
          padding: ${theme.space.m} 0;
          margin: 0;
        }
        .search .ais-Pagination-list button,
        .search-message button {
          font: inherit;
          border: 1px solid ${theme.line.color};
          border-radius: ${theme.size.radius.small};
          background: ${theme.background.color.primary};
          color: ${theme.text.color.brand};
          min-width: 44px;
          min-height: 44px;
          padding: ${theme.space.xs} ${theme.space.s};
          cursor: pointer;
        }
        .search .ais-Pagination-list button:hover:not(:disabled),
        .search .ais-SearchBox-reset:hover,
        .search-message button:hover {
          background: ${theme.color.brand.primary}18;
          border-color: ${theme.color.brand.primary};
        }
        .search .ais-Pagination-list button[aria-current='page'] {
          background: ${theme.text.color.brand};
          border-color: ${theme.text.color.brand};
          color: ${theme.text.color.primaryInverse};
          font-weight: ${theme.font.weight.bold};
        }
        .search .ais-Pagination-list button:disabled {
          color: ${theme.color.neutral.gray.h};
          background: ${theme.background.color.alt};
          cursor: default;
        }
        .search button:focus-visible {
          outline: 2px solid ${theme.text.color.brand};
          outline-offset: 2px;
        }
      `}</style>
    </React.Fragment>
  );
};

Search.propTypes = { theme: PropTypes.object.isRequired };

export default Search;
