import type { HutAvailability } from '../../hut-data/hut-availability';
import type { HutAvailabilityApi } from './type';

export const mapAvailabilityToHutAvailability = (availability: HutAvailabilityApi[number]): HutAvailability => ({
  date: new Date(availability.date),
  dateFormatted: availability.dateFormatted,
  freeBeds: availability.freeBeds,
  totalSleepingPlaces: availability.totalSleepingPlaces
});
