import type { AreaBounds, AvailabilityFilterMode, HutFilterState } from './types';
import { DEFAULT_HUT_FILTERS } from './types';

const PARAM_DATE = 'date';
const PARAM_AVAILABILITY = 'availability';
const PARAM_MIN_BEDS = 'minBeds';
const PARAM_HIDE_NO_RESERVATION = 'hideNoReservation';
/** @deprecated Legacy param — maps to hide huts without reservation data. */
const PARAM_RESERVATION = 'reservation';
const PARAM_AREA = 'area';

const AVAIL_TO_PARAM: Record<AvailabilityFilterMode, string> = {
  any: 'any',
  minBeds: 'min',
  fullyFree: 'free',
};

const PARAM_TO_AVAIL: Record<string, AvailabilityFilterMode> = {
  any: 'any',
  min: 'minBeds',
  free: 'fullyFree',
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseFlag(value: string | null): boolean | undefined {
  if (value === null) return undefined;
  if (value === '1' || value === 'true') return true;
  if (value === '0' || value === 'false') return false;
  return undefined;
}

function parseAreaParam(value: string): AreaBounds | null {
  const parts = value.split(',').map((s) => Number(s.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;

  const [south, west, north, east] = parts;
  if (south >= north || west >= east) return null;

  return [
    [south, west],
    [north, east],
  ];
}

function formatAreaParam(bounds: AreaBounds): string {
  const [[south, west], [north, east]] = bounds;
  return [south, west, north, east].map((n) => n.toFixed(5)).join(',');
}

/** Read area, date, and availability fields from the current URL (or a query string). */
export function parseFiltersFromSearchParams(search: string): Partial<HutFilterState> {
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const partial: Partial<HutFilterState> = {};

  const date = params.get(PARAM_DATE);
  if (date && ISO_DATE.test(date)) {
    partial.availabilityDate = date;
  }

  const availability = params.get(PARAM_AVAILABILITY);
  if (availability && PARAM_TO_AVAIL[availability]) {
    partial.availabilityMode = PARAM_TO_AVAIL[availability];
  }

  const minBeds = params.get(PARAM_MIN_BEDS);
  if (minBeds !== null) {
    const n = Number(minBeds);
    if (Number.isFinite(n) && n >= 0) {
      partial.minFreeBeds = Math.min(99, Math.floor(n));
    }
  }

  const hideNo = parseFlag(params.get(PARAM_HIDE_NO_RESERVATION));
  if (hideNo !== undefined) partial.hideHutsWithoutReservationData = hideNo;

  const reservation = params.get(PARAM_RESERVATION);
  if (reservation === 'with') {
    partial.hideHutsWithoutReservationData = true;
  }

  const area = params.get(PARAM_AREA);
  if (area) {
    const bounds = parseAreaParam(area);
    if (bounds) partial.areaBounds = bounds;
  }

  return partial;
}

export function readFiltersFromUrl(): Partial<HutFilterState> {
  return parseFiltersFromSearchParams(window.location.search);
}

export function buildSearchParamsForFilters(filters: HutFilterState): URLSearchParams {
  const params = new URLSearchParams();
  const defaults = DEFAULT_HUT_FILTERS;

  if (filters.areaBounds) {
    params.set(PARAM_AREA, formatAreaParam(filters.areaBounds));
  }

  params.set(PARAM_DATE, filters.availabilityDate);

  if (filters.availabilityMode !== defaults.availabilityMode) {
    params.set(PARAM_AVAILABILITY, AVAIL_TO_PARAM[filters.availabilityMode]);
  }

  if (filters.availabilityMode === 'minBeds') {
    params.set(PARAM_MIN_BEDS, String(filters.minFreeBeds));
  }

  if (filters.hideHutsWithoutReservationData) {
    params.set(PARAM_HIDE_NO_RESERVATION, '1');
  }

  return params;
}

export function syncFiltersToUrl(filters: HutFilterState): void {
  const qs = buildSearchParamsForFilters(filters).toString();
  const path = `${window.location.pathname}${window.location.hash}`;
  const nextUrl = qs ? `${path}?${qs}` : path;
  const currentUrl = `${path}${window.location.search}`;

  if (nextUrl !== currentUrl) {
    window.history.replaceState(null, '', nextUrl);
  }
}

export function mergeFiltersWithUrl(base: HutFilterState): HutFilterState {
  return { ...base, ...readFiltersFromUrl() };
}

/** Apply URL query fields onto filter state (resets URL-backed fields when params are absent). */
export function applyUrlSearchToFilters(prev: HutFilterState): HutFilterState {
  return {
    ...prev,
    areaBounds: null,
    availabilityDate: DEFAULT_HUT_FILTERS.availabilityDate,
    availabilityMode: DEFAULT_HUT_FILTERS.availabilityMode,
    hideHutsWithoutReservationData: DEFAULT_HUT_FILTERS.hideHutsWithoutReservationData,
    minFreeBeds: DEFAULT_HUT_FILTERS.minFreeBeds,
    ...readFiltersFromUrl(),
  };
}
