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
  onProgress: (loaded: number, total: number) => void,
  isCancelled: () => boolean,
): Promise<void> {
  const huts = await fetchHutList();
  if (isCancelled()) return;
  onHutsLoaded(huts);

  const toFetch = huts.filter((h) => h.apiId !== null);
  const total = toFetch.length;
  onProgress(0, total);
  if (total === 0) return;

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
    onProgress(Math.min(i + chunk.length, total), total);
  }
}
