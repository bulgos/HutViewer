import { fetchHutList } from '../api/get-hut-data/api';
import { fetchAvailability } from '../api/get-hut-availability/api';
import { mapAvailabilityToHutAvailability } from '../api/get-hut-availability/helper';
import type { HutAvailability } from './hut-availability';
import type { HutType } from './HutType';

const CHUNK_SIZE = 25;

export type AvailabilityBatch = Map<number, HutAvailability[]>;

/**
 * Loads SAC hut data, then fetches availability in chunks and reports each chunk as a batch.
 */
export async function loadHutsWithAvailability(
  onHutsLoaded: (huts: HutType[]) => void,
  onAvailabilityBatch: (batch: AvailabilityBatch) => void,
  isCancelled: () => boolean,
): Promise<void> {
  const huts = await fetchHutList();
  if (isCancelled()) return;
  onHutsLoaded(huts);

  const toFetch = huts.filter((h) => !h.is_private && h.apiId !== null);
  for (let i = 0; i < toFetch.length; i += CHUNK_SIZE) {
    if (isCancelled()) return;
    const chunk = toFetch.slice(i, i + CHUNK_SIZE);
    const results = await Promise.all(
      chunk.map(async (hut) => {
        try {
          const data = await fetchAvailability(hut.apiId);
          const availability = data.map(mapAvailabilityToHutAvailability);
          return [hut.id, availability] as const;
        } catch {
          return null;
        }
      }),
    );

    if (isCancelled()) return;

    const batch: AvailabilityBatch = new Map();
    for (const entry of results) {
      if (entry) batch.set(entry[0], entry[1]);
    }
    if (batch.size > 0) onAvailabilityBatch(batch);
  }
}
