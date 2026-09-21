import React from "react";
import PropTypes from "prop-types";
import {
  Configure,
  Hits,
  InstantSearch,
  Pagination,
  SearchBox,
  Stats,
  connectStateResults
} from "react-instantsearch-dom";
import algoliasearch from "algoliasearch/lite";

import Hit from "./Hit";
import { usePageContext } from "../../i18n/page-context";

const ResultList = ({ searchState, searchResults, lang }) => {
  const query = (searchState && searchState.query) || "";
  const copy =
    lang === "pl"
      ? {
          prompt: "Wpisz wyszukiwaną frazę.",
          empty: "Nie znaleziono pasujących wyników.",
          stats: count => `${count} ${count === 1 ? "wynik" : "wyników"}`
        }
      : {
          prompt: "Start typing to search.",
          empty: "No matching results found.",
          stats: count => `${count} ${count === 1 ? "result" : "results"}`
        };

  if (!query.trim()) return <p className="search-message">{copy.prompt}</p>;
  if (searchResults && searchResults.nbHits === 0) {
    return <p className="search-message">{copy.empty}</p>;
  }

  return (
    <React.Fragment>
      <Stats translations={{ stats: copy.stats }} />
      <Hits hitComponent={Hit} />
      <Pagination />
    </React.Fragment>
  );
};

ResultList.propTypes = {
  searchState: PropTypes.object,
  searchResults: PropTypes.object,
  lang: PropTypes.string.isRequired
};

const SearchResults = connectStateResults(ResultList);

const Search = props => {
  const { algolia, theme } = props;
  const { lang = "en" } = usePageContext();

  const searchClient = algoliasearch(algolia.appId, algolia.searchOnlyApiKey);
  const placeholder = lang === "pl" ? "Szukaj" : "Search";

  return (
    <React.Fragment>
      <div className="search">
        {algolia && algolia.appId && (
          <InstantSearch indexName={algolia.indexName} searchClient={searchClient}>
            <Configure
              filters={`langKey:${lang}`}
              distinct={1}
              hitsPerPage={10}
              attributesToSnippet={["content:32"]}
              snippetEllipsisText="…"
            />
            <SearchBox translations={{ placeholder }} />
            <SearchResults lang={lang} />
          </InstantSearch>
        )}
      </div>

      {/* --- STYLES --- */}
      <style jsx global>{`
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
        .ais-Pagination-item a,
        .ais-Pagination-item span {
          color: #666;
          font-size: 1.2em;
          display: block;
          padding: 0.5em 0.5em 2em;
        }
        .ais-Pagination-item a:hover {
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

Search.propTypes = {
  algolia: PropTypes.object.isRequired,
  theme: PropTypes.object.isRequired
};

export default Search;
