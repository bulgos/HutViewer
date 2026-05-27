import type { PathOptions } from 'leaflet';
import { hutHasAvailabilityData } from '../filters/hutAvailabilityData';
import {
  availabilityLevel,
  availabilityMarkerPathOptions,
  getAvailabilityStatus,
  type HutAvailability
} from '../hut-data/hut-availability';
import { pickAvailabilityDay } from '../filters/pickAvailabilityDay';
import type { HutType } from '../hut-data/HutType';
import { currentMonthOpening, openingMarkerPathOptions } from '../hut-data/openingStatus';

const DIM_OPACITY_FACTOR = 0.5;

function dimPathOptions(options: PathOptions): PathOptions {
  return {
    ...options,
    opacity: (options.opacity ?? 1) * DIM_OPACITY_FACTOR,
    fillOpacity: (options.fillOpacity ?? 0.9) * DIM_OPACITY_FACTOR
  };
}

export function hutMarkerPathOptions(
  hut: HutType,
  availability: HutAvailability[],
  availabilityDate: string
): PathOptions {
  const hasAvailability = hutHasAvailabilityData(availability, availabilityDate);

  if (hasAvailability) {
    const day = pickAvailabilityDay(availability, availabilityDate)!;
    const bookedPct = availabilityLevel(day.freeBeds, day.totalSleepingPlaces);
    return availabilityMarkerPathOptions(getAvailabilityStatus(bookedPct));
  }

  return dimPathOptions(openingMarkerPathOptions(currentMonthOpening(hut)));
}
