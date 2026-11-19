import { useCallback, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

export type SheetSnap = 'bottom' | 'middle' | 'top';

const SNAPS: SheetSnap[] = ['bottom', 'middle', 'top'];
/** Room kept free above the sheet at its top position (zoom buttons). */
const TOP_GAP = 72;
const MIDDLE_SHARE = 0.42;
const DRAG_THRESHOLD = 6;
/** px per ms; a faster release moves one step in that direction */
const FLICK_SPEED = 0.5;

/**
 * Phone bottom sheet with three heights for its content: none (only the header), about half
 * the screen, or as high as it goes. The header can be dragged; a tap on the handle steps through them.
 */
export function useSheetSnap(headerRef: RefObject<HTMLElement | null>) {
  const [snap, setSnap] = useState<SheetSnap>('middle');
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [viewport, setViewport] = useState(() => ({ h: window.innerHeight, header: 0 }));

  useLayoutEffect(() => {
    const measure = () => setViewport({ h: window.innerHeight, header: headerRef.current?.offsetHeight ?? 0 });
    measure();
    const observer = new ResizeObserver(measure);
    if (headerRef.current) observer.observe(headerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [headerRef]);

  const heightFor = useCallback(
    (s: SheetSnap) => {
      const top = Math.max(0, viewport.h - TOP_GAP - viewport.header);
      if (s === 'bottom') return 0;
      if (s === 'middle') return Math.min(top, Math.round(viewport.h * MIDDLE_SHARE));
      return top;
    },
    [viewport]
  );

  const contentHeight = dragHeight ?? heightFor(snap);

  // height of the whole sheet once it settles; read when recentering the map
  const settledHeightRef = useRef(0);
  useLayoutEffect(() => {
    settledHeightRef.current = viewport.header + heightFor(snap);
  }, [viewport, heightFor, snap]);
  const getSettledHeight = useCallback(() => settledHeightRef.current, []);

  const drag = useRef<{ id: number; y: number; t: number; h: number; moved: boolean; onHandle: boolean } | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!e.isPrimary || (e.target as Element).closest('input, select, [role="tab"]')) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      drag.current = {
        id: e.pointerId,
        y: e.clientY,
        t: e.timeStamp,
        h: heightFor(snap),
        moved: false,
        // pointer capture retargets the release, so remember where the press started
        onHandle: !!(e.target as Element).closest('.hut-sheet-handle')
      };
    },
    [heightFor, snap]
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      const dy = d.y - e.clientY;
      if (!d.moved && Math.abs(dy) < DRAG_THRESHOLD) return;
      d.moved = true;
      setDragHeight(Math.min(heightFor('top'), Math.max(0, d.h + dy)));
    },
    [heightFor]
  );

  const onPointerUp = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.id !== e.pointerId) return;
      drag.current = null;
      setDragHeight(null);

      const current = SNAPS.indexOf(snap);
      if (!d.moved) {
        // tap: only the handle steps through the heights
        if (d.onHandle) setSnap(SNAPS[(current + 1) % SNAPS.length]);
        return;
      }

      const dy = d.y - e.clientY;
      const speed = dy / Math.max(1, e.timeStamp - d.t);
      if (Math.abs(speed) > FLICK_SPEED) {
        const next = Math.min(SNAPS.length - 1, Math.max(0, current + Math.sign(speed)));
        setSnap(SNAPS[next]);
        return;
      }
      const h = Math.min(heightFor('top'), Math.max(0, d.h + dy));
      const nearest = SNAPS.reduce((a, b) => (Math.abs(heightFor(b) - h) < Math.abs(heightFor(a) - h) ? b : a));
      setSnap(nearest);
    },
    [heightFor, snap]
  );

  return {
    snap,
    setSnap,
    contentHeight,
    dragging: dragHeight !== null,
    getSettledHeight,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
  };
}
