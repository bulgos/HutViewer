import type { HutAvailability } from '../../hut-data/hut-availability';
import { AVAILABILITY_API_BASE, isAvailabilityApiEnabled } from './config';
import { mapAvailabilityToHutAvailability } from './helper';
import type { HutAvailabilityApi } from './type';

export { isAvailabilityApiEnabled } from './config';

const URL = `${AVAILABILITY_API_BASE}/api/v1/reservation/getHutAvailability?hutId={hutId}&step=WIZARD`;

export const fetchAvailability = async (hutId: number): Promise<HutAvailability[]> => {
  if (!isAvailabilityApiEnabled()) {
    return [];
  }

  const response = await fetch(URL.replace('{hutId}', hutId.toString()));
  if (!response.ok) {
    throw new Error(`Availability request failed (${response.status})`);
  }
  const data = (await response.json()) as HutAvailabilityApi;
  return data.map(mapAvailabilityToHutAvailability);
};
