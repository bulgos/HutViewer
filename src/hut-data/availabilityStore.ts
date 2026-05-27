import type { HutAvailability } from './hut-availability';

export type AvailabilityByHutId = ReadonlyMap<number, HutAvailability[]>;

export const EMPTY_AVAILABILITY: HutAvailability[] = [];

export function getHutAvailability(
  hutId: number,
  availabilityByHutId: AvailabilityByHutId,
): HutAvailability[] {
  return availabilityByHutId.get(hutId) ?? EMPTY_AVAILABILITY;
}

export function mergeAvailabilityBatch(
  prev: AvailabilityByHutId,
  batch: ReadonlyMap<number, HutAvailability[]>,
): Map<number, HutAvailability[]> {
  const next = new Map(prev);
  for (const [hutId, availability] of batch) {
    next.set(hutId, availability);
  }
  return next;
}
