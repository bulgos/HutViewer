import type { ServiceKey, SuitabilityKey } from '../hut-data/filter-labels';

/** [[southWestLat, southWestLng], [northEastLat, northEastLng]] */
export type AreaBounds = [[number, number], [number, number]];

export type AvailabilityFilterMode = 'any' | 'minBeds' | 'fullyFree';

export type HutFilterState = {
  areaBounds: AreaBounds | null;
  availabilityMode: AvailabilityFilterMode;
  minFreeBeds: number;
  requiredServices: ServiceKey[];
  requiredSuitable: SuitabilityKey[];
};

export const DEFAULT_HUT_FILTERS: HutFilterState = {
  areaBounds: null,
  availabilityMode: 'any',
  minFreeBeds: 1,
  requiredServices: [],
  requiredSuitable: [],
};

export function filtersNeedAvailability(filters: HutFilterState): boolean {
  return filters.availabilityMode === 'minBeds' || filters.availabilityMode === 'fullyFree';
}

export function hasActiveFilters(filters: HutFilterState): boolean {
  return (
    filters.areaBounds !== null ||
    filters.availabilityMode !== 'any' ||
    filters.requiredServices.length > 0 ||
    filters.requiredSuitable.length > 0
  );
}
