import type { HutAvailability } from '../hut-data/hut-availability';
import { pickAvailabilityDay } from './pickAvailabilityDay';

/** Reservation data exists for the filter date with non-zero capacity. */
export function hutHasAvailabilityData(availability: HutAvailability[], availabilityDate: string): boolean {
  if (availability.length === 0) return false;
  const day = pickAvailabilityDay(availability, availabilityDate);
  return day !== undefined && day.totalSleepingPlaces > 0;
}
