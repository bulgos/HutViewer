import type { HutAvailability } from '../../hut-data/hut-availability';
import type { OpeningType, HutType } from '../../hut-data/HutType';
import type { HutTypeApi } from './type';

const swissToWgs84 = (E: number, N: number): [number, number] => {
  // Step 1: normalize coordinates
  const y = (E - 2600000) / 1e6;
  const x = (N - 1200000) / 1e6;

  // Step 2: calculate latitude and longitude (arcseconds * 1e-4)
  let lat = 16.9023892 + 3.238272 * x - 0.270978 * y * y - 0.002528 * x * x - 0.0447 * y * y * x - 0.014 * x * x * x;

  let lon = 2.6779094 + 4.728982 * y + 0.791484 * y * x + 0.1306 * y * x * x - 0.0436 * y * y * y;

  // Step 3: convert to degrees
  lat = (lat * 100) / 36;
  lon = (lon * 100) / 36;

  return [lat, lon];
};

const mapOpeningToOpeningType = (data: HutTypeApi['opening']): OpeningType[] =>
  Object.entries(data)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([_, value]) => (value === 2 ? 'closed' : value === 1 ? 'open' : 'serviced'));

export const mapType = (data: HutTypeApi): 'hut' | 'refuge' =>
  (data.sleeps as number) === (data.emergency_shelter as number) ? 'refuge' : 'hut';

export const mapDataToHutType = (data: HutTypeApi, availability: HutAvailability[] = []): HutType => ({
  location: swissToWgs84(...data.geom.coordinates),
  geographical_name: data.geographical_name,
  sleeps: data.sleeps,
  id: data.id,
  sacId: data.sac_id,
  apiId: (data.hrs_id as number) === 0 ? null : data.hrs_id,
  is_private: data.is_private,
  url: data.url?.trim() || null,
  openings: mapOpeningToOpeningType(data.opening),
  services: data.services,
  suitable: data.suitable,
  availability,
  rawData: data,
  type: mapType(data)
});
