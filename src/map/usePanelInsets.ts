import { useCallback, type RefObject } from 'react';

export type PanelInsets = { right: number; bottom: number };

const GAP = 8;

/**
 * How much of the map the floating panels cover, read at call time.
 * Desktop: a column on the right. Phone: a sheet along the bottom (full width).
 */
export function usePanelInsets(panelsRef: RefObject<HTMLElement | null>, mobile: boolean): () => PanelInsets {
  return useCallback(() => {
    const el = panelsRef.current;
    if (!el) return { right: 0, bottom: 0 };
    const rect = el.getBoundingClientRect();
    return mobile
      ? { right: 0, bottom: Math.max(0, Math.ceil(window.innerHeight - rect.top + GAP)) }
      : { right: Math.max(0, Math.ceil(window.innerWidth - rect.left + GAP)), bottom: 0 };
  }, [panelsRef, mobile]);
}
