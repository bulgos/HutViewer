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
    .map(([_, value]) => (value === 2 ? 'open' : value === 1 ? 'serviced' : 'closed'));

export const mapDataToHutType = (data: HutTypeApi): HutType => ({
  location: swissToWgs84(...data.geom.coordinates),
  geographical_name: data.geographical_name,
  sleeps: data.sleeps,
  id: data.sac_id,
  is_private: data.is_private,
  openings: mapOpeningToOpeningType(data.opening),
  services: data.services,
  suitable: data.suitable
});
