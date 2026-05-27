import { AVAILABILITY_API_BASE } from './config';
import type { HutAvailabilityApi } from './type';

const URL = `${AVAILABILITY_API_BASE}/api/v1/reservation/getHutAvailability?hutId={hutId}&step=WIZARD`;

export const fetchAvailability = async (apiId: number | null): Promise<HutAvailabilityApi> => {
  if (apiId === null) return [] as unknown as HutAvailabilityApi;
  const response = await fetch(URL.replace('{hutId}', apiId.toString()));
  if (!response.ok) {
    throw new Error(`Availability request failed (${response.status})`);
  }
  return (await response.json()) as HutAvailabilityApi;
};
