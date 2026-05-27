import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';
import { setHoveredHutId } from './hoverStore';

type HutHoverActions = {
  hoverHut: (hutId: number) => void;
  unhoverHut: () => void;
};

const HutHoverContext = createContext<HutHoverActions | null>(null);

/** Delay clearing hover so moving between map marker and result card does not flicker. */
const UNHOVER_DELAY_MS = 80;

export function HutHoverProvider({ children }: { children: ReactNode }) {
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hoverHut = useCallback((hutId: number) => {
    if (clearTimerRef.current) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    setHoveredHutId(hutId);
  }, []);

  const unhoverHut = useCallback(() => {
    if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    clearTimerRef.current = setTimeout(() => {
      setHoveredHutId(null);
      clearTimerRef.current = null;
    }, UNHOVER_DELAY_MS);
  }, []);

  return <HutHoverContext.Provider value={{ hoverHut, unhoverHut }}>{children}</HutHoverContext.Provider>;
}

export function useHutHoverActions(): HutHoverActions {
  const ctx = useContext(HutHoverContext);
  if (!ctx) {
    throw new Error('useHutHoverActions must be used within HutHoverProvider');
  }
  return ctx;
}
