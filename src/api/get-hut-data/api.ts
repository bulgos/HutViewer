import type { HutType } from '../../hut-data/HutType';
import { mapDataToHutType } from './helper';
import type { HutTypeApi } from './type';

const URL = 'https://www.suissealpine.sac-cas.ch/api/1/poi/search?lang=en&output_lang=en&type=hut&limit=1000';

/** SAC hut list only; availability is loaded separately and merged into each hut. */
export const fetchHutList = async (): Promise<HutType[]> => {
  const response = await fetch(URL);
  if (!response.ok) {
    throw new Error(`Hut data request failed (${response.status})`);
  }
  const data = (await response.json()) as { results: HutTypeApi[] };
  return data.results.map((hut) => mapDataToHutType(hut, []));
};
