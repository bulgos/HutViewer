import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchAvailability } from '../api/get-hut-availability/api';
import type { HutAvailability } from '../hut-data/hut-availability';
import type { HutType } from '../hut-data/HutType';

const CHUNK_SIZE = 5;

/** Only fetches availability for the given hut subset (e.g. after map/service filters). */
export function useAvailabilityPrefetch(
  huts: HutType[],
  enabled: boolean,
): { availabilityByHutId: Record<number, HutAvailability[]>; loading: boolean } {
  const [availabilityByHutId, setAvailabilityByHutId] = useState<
    Record<number, HutAvailability[]>
  >({});
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(availabilityByHutId);
  cacheRef.current = availabilityByHutId;

  const targetIdsKey = useMemo(
    () =>
      huts
        .filter((h) => !h.is_private)
        .map((h) => h.id)
        .sort((a, b) => a - b)
        .join(','),
    [huts],
  );

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const missing = huts.filter(
      (h) => !h.is_private && cacheRef.current[h.id] === undefined,
    );
    if (missing.length === 0) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      for (let i = 0; i < missing.length; i += CHUNK_SIZE) {
        if (cancelled) break;
        const chunk = missing.slice(i, i + CHUNK_SIZE);
        await Promise.all(
          chunk.map(async (hut) => {
            try {
              const data = await fetchAvailability(hut.apiId);
              if (!cancelled) {
                setAvailabilityByHutId((prev) => ({ ...prev, [hut.id]: data }));
              }
            } catch {
              if (!cancelled) {
                setAvailabilityByHutId((prev) => ({ ...prev, [hut.id]: [] }));
              }
            }
          }),
        );
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, targetIdsKey, huts]);

  return { availabilityByHutId, loading };
}
