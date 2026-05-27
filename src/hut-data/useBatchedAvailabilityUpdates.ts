import { startTransition, useCallback, useEffect, useRef, useState } from 'react';
import type { HutAvailability } from './hut-availability';
import { mergeAvailabilityBatch, type AvailabilityByHutId } from './availabilityStore';

export function useBatchedAvailabilityUpdates() {
  const [availabilityByHutId, setAvailabilityByHutId] = useState<AvailabilityByHutId>(new Map());
  const pendingRef = useRef<Map<number, HutAvailability[]>>(new Map());
  const rafRef = useRef<number | null>(null);

  const flush = useCallback(() => {
    rafRef.current = null;
    const batch = pendingRef.current;
    if (batch.size === 0) return;
    pendingRef.current = new Map();

    startTransition(() => {
      setAvailabilityByHutId((prev) => mergeAvailabilityBatch(prev, batch));
    });
  }, []);

  const scheduleBatch = useCallback(
    (batch: ReadonlyMap<number, HutAvailability[]>) => {
      for (const [hutId, availability] of batch) {
        pendingRef.current.set(hutId, availability);
      }
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(flush);
      }
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { availabilityByHutId, scheduleBatch };
}
