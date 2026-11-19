import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { HutType } from '../hut-data/HutType';
import { flyToHutVisible } from './flyToHut';
import type { PanelInsets } from './usePanelInsets';

const SELECT_ZOOM = 12;

/** `keepZoom`: only pan, and only when the hut is hidden behind the panels (marker taps). */
export type MapFocusRequest = { hut: HutType; keepZoom: boolean; nonce: number };

type Props = {
  request: MapFocusRequest | null;
  getInsets: () => PanelInsets;
};

/** Recenters the map after layout (panels) has settled so the insets are accurate. */
export function MapFlyToHut({ request, getInsets }: Props) {
  const map = useMap();

  useEffect(() => {
    if (!request) return;

    let cancelled = false;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        if (cancelled) return;
        const zoom = request.keepZoom ? map.getZoom() : SELECT_ZOOM;
        flyToHutVisible(map, request.hut.location, zoom, getInsets(), request.keepZoom);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
    // getInsets reads the layout at call time; re-run only on a new request
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request, map]);

  return null;
}
