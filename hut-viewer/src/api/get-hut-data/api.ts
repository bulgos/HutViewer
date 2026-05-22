import type { HutType } from '../../hut-data/HutType';
import { mapDataToHutType } from './helper';
import type { HutTypeApi } from './type';

const URL = 'https://www.suissealpine.sac-cas.ch/api/1/poi/search?lang=en&output_lang=en&type=hut&limit=1000';

export const fetchAllInformation = async (): Promise<HutType[]> => {
  const response = await fetch(URL);
  const data = (await response.json()) as { results: HutTypeApi[] };
  return data.results.map(mapDataToHutType);
};
