import { useSyncExternalStore } from 'react';

/** Phone layout: panels become a bottom sheet. Keep in sync with the 640px media queries in the CSS. */
export const MOBILE_QUERY = '(max-width: 640px)';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
