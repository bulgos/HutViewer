import type { OpeningType, HutType } from '../hut-data/HutType';

const URL = 'https://www.suissealpine.sac-cas.ch/api/1/poi/search?lang=en&output_lang=en&type=hut&limit=1000';

const ExampleHut = {
  display_name: 'Aarbiwak SAC',
  en_translation_ok: true,
  fr_translation_ok: true,
  geographical_name: 'Aarbiwak SAC',
  geom: {
    type: 'Point',
    coordinates: [2654722, 1156279]
  },
  gis_geometry_ok: false,
  id: 2147000001,
  is_private: false,
  it_translation_ok: true,
  main_lang: 'en',
  nvp_ok: false,
  orig_status: null,
  fax: null,
  tel: null,
  url: 'http://www.sac-pilatus.ch',
  email: 'k.brefin@livenet.ch',
  owner: 'SAC PILATUS',
  hrs_id: 603,
  sac_id: 1,
  sleeps: 17,
  opening: {
    month_01: 0,
    month_02: 1,
    month_03: 2,
    month_04: 0,
    month_05: 0,
    month_06: 0,
    month_07: 0,
    month_08: 0,
    month_09: 0,
    month_10: 0,
    month_11: 0,
    month_12: 0
  },
  catering: {
    month_01: 2,
    month_02: 2,
    month_03: 2,
    month_04: 2,
    month_05: 2,
    month_06: 2,
    month_07: 2,
    month_08: 2,
    month_09: 2,
    month_10: 2,
    month_11: 2,
    month_12: 2
  },
  opentext: {
    de: 'Kein Mobiltelefonempfang, nur Notfunkanlage',
    en: null,
    fr: "Pas de connexion téléphonique, uniquement réseau d'urgence",
    it: null
  },
  services: {
    drinks: true,
    internet: false,
    not_paid: false,
    css_rebate: false,
    half_board: false,
    plain_meals: false,
    family_rooms: false,
    payment_mobile: false,
    cooking_catered: true,
    dogs_on_request: false,
    payment_creditcard: false,
    cooking_non_catered: true,
    separable_group_rooms: false
  },
  suitable: {
    family: false,
    climbing: false,
    alpine_tour: false,
    via_ferrata: false,
    climbing_kids: false,
    mountain_hiking: true,
    ski_snowboard_tour: true
  }
} as const;

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

const mapOpeningToOpeningType = (data: (typeof ExampleHut)['opening']): OpeningType[] =>
  Object.entries(data)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([_, value]) => (value === 2 ? 'open' : value === 1 ? 'serviced' : 'closed'));

const mapDataToHutType = (data: typeof ExampleHut): HutType => ({
  location: swissToWgs84(...data.geom.coordinates),
  geographical_name: data.geographical_name,
  sleeps: data.sleeps,
  id: data.id,
  is_private: data.is_private,
  openings: mapOpeningToOpeningType(data.opening),
  services: data.services,
  suitable: data.suitable
});

export const fetchAllInformation = async (): Promise<HutType[]> => {
  const response = await fetch(URL);
  const data = (await response.json()) as { results: (typeof ExampleHut)[] };

  return data.results.map(mapDataToHutType);
};
