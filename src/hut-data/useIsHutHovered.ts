import { useSyncExternalStore } from 'react';
import { getHoveredHutId, subscribeHoveredHut } from './hoverStore';

export function useIsHutHovered(hutId: number): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribeHoveredHut(hutId, onStoreChange),
    () => getHoveredHutId() === hutId,
  );
}
