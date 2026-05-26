import type { HutAvailability } from '../../hut-data/hut-availability';
import { mapAvailabilityToHutAvailability } from './helper';
import type { HutAvailabilityApi } from './type';

/** Dev/preview: Vite proxy. Production (GitHub Pages): direct API URL via env. */
const API_BASE = import.meta.env.VITE_HUT_RESERVATION_API_BASE ?? '/hut-reservation-api';
const URL = `${API_BASE}/api/v1/reservation/getHutAvailability?hutId={hutId}&step=WIZARD`;

export const fetchAvailability = async (hutId: number): Promise<HutAvailability[]> => {
  const response = await fetch(URL.replace('{hutId}', hutId.toString()));
  if (!response.ok) {
    throw new Error(`Availability request failed (${response.status})`);
  }
  const data = (await response.json()) as HutAvailabilityApi;
  return data.map(mapAvailabilityToHutAvailability);
};
