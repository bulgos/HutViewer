import type { HutAvailability } from '../../hut-data/hut-availability';
import { mapAvailabilityToHutAvailability } from './helper';
import type { HutAvailabilityApi } from './type';

/** Same-origin in dev/preview via Vite proxy (see vite.config.ts). */
const URL =
  '/hut-reservation-api/api/v1/reservation/getHutAvailability?hutId={hutId}&step=WIZARD';

export const fetchAvailability = async (hutId: number): Promise<HutAvailability[]> => {
  const response = await fetch(URL.replace('{hutId}', hutId.toString()));
  if (!response.ok) {
    throw new Error(`Availability request failed (${response.status})`);
  }
  const data = (await response.json()) as HutAvailabilityApi;
  return data.map(mapAvailabilityToHutAvailability);
};
