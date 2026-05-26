import type { HutAvailability } from '../../hut-data/hut-availability';
import { AVAILABILITY_API_BASE } from './config';
import { mapAvailabilityToHutAvailability } from './helper';
import type { HutAvailabilityApi } from './type';

const URL = `${AVAILABILITY_API_BASE}/api/v1/reservation/getHutAvailability?hutId={hutId}&step=WIZARD`;

export const fetchAvailability = async (apiId: number): Promise<HutAvailability[]> => {
  const response = await fetch(URL.replace('{hutId}', apiId.toString()));
  if (!response.ok) {
    throw new Error(`Availability request failed (${response.status})`);
  }
  const data = (await response.json()) as HutAvailabilityApi;
  return data.map(mapAvailabilityToHutAvailability);
};
