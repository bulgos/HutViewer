import L from 'leaflet';
import { isAvailabilityApiEnabled } from '../api/get-hut-availability/config';
import type { HutAvailability } from '../hut-data/hut-availability';
import type { HutType } from '../hut-data/HutType';
import { pickAvailabilityDay } from './pickAvailabilityDay';
import type { AreaBounds, HutFilterState } from './types';

const MIN_AREA_DEG = 0.02;

export function normalizeAreaBounds(
  cornerA: { lat: number; lng: number },
  cornerB: { lat: number; lng: number },
): AreaBounds | null {
  const south = Math.min(cornerA.lat, cornerB.lat);
  const north = Math.max(cornerA.lat, cornerB.lat);
  const west = Math.min(cornerA.lng, cornerB.lng);
  const east = Math.max(cornerA.lng, cornerB.lng);

  if (north - south < MIN_AREA_DEG || east - west < MIN_AREA_DEG) {
    return null;
  }

  return [
    [south, west],
    [north, east],
  ];
}

export function hutInArea(hut: HutType, bounds: AreaBounds): boolean {
  const [[south, west], [north, east]] = bounds;
  const point = L.latLng(hut.location[0], hut.location[1]);
  return L.latLngBounds(L.latLng(south, west), L.latLng(north, east)).contains(point);
}

function hutMatchesServices(hut: HutType, required: HutFilterState['requiredServices']): boolean {
  if (required.length === 0) return true;
  return required.every((key) => hut.services[key] === true);
}

function hutMatchesSuitable(hut: HutType, required: HutFilterState['requiredSuitable']): boolean {
  if (required.length === 0) return true;
  return required.every((key) => hut.suitable[key] === true);
}

function hutMatchesAvailability(
  hut: HutType,
  filters: HutFilterState,
  availabilityByHutId: Record<number, HutAvailability[]>,
): boolean {
  if (filters.availabilityMode === 'any') return true;
  if (hut.is_private) return false;

  const days = availabilityByHutId[hut.id];
  if (!days || days.length === 0) return false;

  const day = pickAvailabilityDay(days);
  if (!day) return false;

  if (filters.availabilityMode === 'fullyFree') {
    return day.totalSleepingPlaces > 0 && day.freeBeds >= day.totalSleepingPlaces;
  }

  return day.freeBeds >= Math.max(0, filters.minFreeBeds);
}

/** Apply filters that do not need reservation API data. */
export function applyHutFiltersWithoutAvailability(
  huts: HutType[],
  filters: HutFilterState,
): HutType[] {
  return huts.filter((hut) => {
    if (filters.areaBounds && !hutInArea(hut, filters.areaBounds)) return false;
    if (!hutMatchesServices(hut, filters.requiredServices)) return false;
    if (!hutMatchesSuitable(hut, filters.requiredSuitable)) return false;
    return true;
  });
}

export function applyHutFilters(
  huts: HutType[],
  filters: HutFilterState,
  availabilityByHutId: Record<number, HutAvailability[]>,
): HutType[] {
  return applyHutFiltersWithoutAvailability(huts, filters).filter((hut) => {
    if (!isAvailabilityApiEnabled()) return true;
    return hutMatchesAvailability(hut, filters, availabilityByHutId);
  });
}
