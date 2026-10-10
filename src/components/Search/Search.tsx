import type MiniSearch from 'minisearch';
import type { SearchDocument } from '../../search/types.ts';
import type { searchIndex } from '../../search/runtime.ts';
type LoadedSearch = {
  lang: string;
  index: MiniSearch<SearchDocument>;
  search: typeof searchIndex;
};
import * as styles from './Search.module.css';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { withPrefix } from 'gatsby';
import Hit from './Hit.tsx';
import { FaSearch } from 'react-icons/fa';
import { usePageContext } from '../../i18n/page-context.ts';

const Search = () => {
  const { lang = 'en' } = usePageContext();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [loaded, setLoaded] = useState<LoadedSearch | null>(null);
  const [status, setStatus] = useState('idle');
  const [retry, setRetry] = useState(0);
  const [page, setPage] = useState(0);
  const resultsList = useRef<HTMLUListElement>(null);
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
          stats: (count: number) =>
            `${count} ${count === 1 ? 'wynik' : 'wyników'}`,
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
          stats: (count: number) =>
            `${count} ${count === 1 ? 'result' : 'results'}`,
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
    const fetchText = async (url: string) => {
      const response = await fetch(withPrefix(url), {
        signal: controller.signal,
        cache: 'no-cache',
      });
      if (!response.ok) throw new Error('Search index unavailable');
      return response.text();
    };
    Promise.all([
      import(
        /* webpackChunkName: "local-search-engine" */ '../../search/runtime.ts'
      ),
      fetchText('/search-index/manifest.json').then(async (text) => {
        const manifest = JSON.parse(text) as Record<string, unknown>;
        const url = manifest[lang];
        if (
          typeof url !== 'string' ||
          !/^\/search-index\/(en|pl)\.[a-f0-9]+\.json$/.test(url)
        )
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
    () =>
      loaded?.lang === lang && debounced
        ? loaded.search(loaded.index, debounced)
        : [],
    [loaded, lang, debounced],
  );
  const pages = Math.ceil(results.length / 10);
  const currentPage = Math.min(page, Math.max(0, pages - 1));
  const updateQuery = (value: string) => {
    setQuery(value);
    setPage(0);
  };
  const goToPage = (page: number) => {
    setPage(page);
    resultsList.current?.scrollIntoView({ block: 'start' });
  };
  return (
    <React.Fragment>
      <div className={`search ${styles.search}`}>
        <div className={'ais-SearchBox'}>
          <form
            className={`ais-SearchBox-form ${styles.aisSearchBoxForm}`}
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <FaSearch
              className={`search-input-icon ${styles.searchInputIcon}`}
              aria-hidden="true"
            />
            <input
              className={`ais-SearchBox-input ${styles.aisSearchBoxInput}`}
              type="search"
              aria-label={copy.search}
              placeholder={copy.search}
              maxLength={160}
              value={query}
              onChange={(event) => updateQuery(event.target.value)}
            />
            <button
              hidden={!query}
              className={`ais-SearchBox-reset ${styles.aisSearchBoxReset}`}
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
            <p className={`search-message ${styles.searchMessage}`}>
              {copy.prompt}
            </p>
          ) : status === 'error' ? (
            <p className={`search-message ${styles.searchMessage}`}>
              {copy.error}{' '}
              <button
                type="button"
                onClick={() => setRetry((value) => value + 1)}
              >
                {copy.retry}
              </button>
            </p>
          ) : loaded?.lang !== lang ? (
            <p className={`search-message ${styles.searchMessage}`}>
              {copy.loading}
            </p>
          ) : results.length === 0 ? (
            <p className={`search-message ${styles.searchMessage}`}>
              {copy.empty}
            </p>
          ) : (
            <span className={`ais-Stats ${styles.aisStats}`}>
              {copy.stats(results.length)}
            </span>
          )}
        </div>
        {requested && loaded?.lang === lang && results.length > 0 && (
          <>
            <ul
              className={`ais-Hits-list ${styles.aisHitsList}`}
              ref={resultsList}
            >
              {results
                .slice(currentPage * 10, currentPage * 10 + 10)
                .map((hit) => (
                  <li className={'ais-Hits-item'} key={hit.id}>
                    <Hit hit={hit} />
                  </li>
                ))}
            </ul>
            {pages > 1 && (
              <nav aria-label={copy.navigation}>
                <ul
                  className={`ais-Pagination-list ${styles.aisPaginationList}`}
                >
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
                        index === 0 ||
                        index === pages - 1 ||
                        Math.abs(index - currentPage) <= 2,
                    )
                    .map((index) => (
                      <li key={index}>
                        <button
                          type="button"
                          aria-label={`${copy.navigation}: ${index + 1}`}
                          aria-current={
                            index === currentPage ? 'page' : undefined
                          }
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
    </React.Fragment>
  );
};

export default Search;
