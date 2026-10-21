import React from 'react';
import Hit from './Hit.tsx';
import SearchView from './SearchView.tsx';
export default function Search() {
  return <SearchView renderHit={(hit) => <Hit hit={hit} />} />;
}
