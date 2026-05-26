import { useEffect, useState, type RefObject } from 'react';

/** Width of fixed right-side panels plus gap from viewport edge (px). */
export function useRightPanelWidth(panelsRef: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = panelsRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setWidth(Math.ceil(window.innerWidth - rect.left + 8));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [panelsRef]);

  return width;
}
