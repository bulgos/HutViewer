import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { HutType } from '../hut-data/HutType';
import { flyToHutVisible } from './flyToHut';

const SELECT_ZOOM = 12;

type Props = {
  hut: HutType | null;
  paddingRightPx: number;
};

/** Recenters the map after layout (panels) has settled so padding is accurate. */
export function MapFlyToHut({ hut, paddingRightPx }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!hut) return;

    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;
        flyToHutVisible(map, hut.location, SELECT_ZOOM, paddingRightPx);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, [hut, paddingRightPx, map]);

  return null;
}
