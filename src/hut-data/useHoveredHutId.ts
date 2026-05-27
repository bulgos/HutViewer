import { useSyncExternalStore } from 'react';
import { getHoveredHutId, subscribeHoverGlobal } from './hoverStore';

export function useHoveredHutId(): number | null {
  return useSyncExternalStore(subscribeHoverGlobal, getHoveredHutId, getHoveredHutId);
}
