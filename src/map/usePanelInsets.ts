import { useCallback, type RefObject } from 'react';

export type PanelInsets = { right: number; bottom: number };

const GAP = 8;

/**
 * How much of the map the floating panels cover, read at call time.
 * Desktop: a column on the right. Phone: a sheet along the bottom (full width), whose
 * settled height is passed in, so a recenter during the sheet's animation uses where it ends up.
 */
export function usePanelInsets(
  panelsRef: RefObject<HTMLElement | null>,
  mobile: boolean,
  getSheetHeight: () => number
): () => PanelInsets {
  return useCallback(() => {
    if (mobile) return { right: 0, bottom: Math.ceil(getSheetHeight() + GAP) };
    const el = panelsRef.current;
    if (!el) return { right: 0, bottom: 0 };
    const rect = el.getBoundingClientRect();
    return { right: Math.max(0, Math.ceil(window.innerWidth - rect.left + GAP)), bottom: 0 };
  }, [panelsRef, mobile, getSheetHeight]);
}
