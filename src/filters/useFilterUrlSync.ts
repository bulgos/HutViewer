import { useEffect, type Dispatch, type SetStateAction } from 'react';
import { applyUrlSearchToFilters, mergeFiltersWithUrl, syncFiltersToUrl } from './filterUrl';
import { DEFAULT_HUT_FILTERS, type HutFilterState } from './types';

export function getInitialFiltersFromUrl(): HutFilterState {
  return mergeFiltersWithUrl(DEFAULT_HUT_FILTERS);
}

/** Keeps area, date, and availability filter fields in the URL query string. */
export function useFilterUrlSync(
  filters: HutFilterState,
  setFilters: Dispatch<SetStateAction<HutFilterState>>,
): void {
  useEffect(() => {
    syncFiltersToUrl(filters);
  }, [filters]);

  useEffect(() => {
    const onPopState = () => {
      setFilters((prev) => applyUrlSearchToFilters(prev));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setFilters]);
}
