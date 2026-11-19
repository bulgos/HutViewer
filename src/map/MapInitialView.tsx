import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { AreaBounds } from '../filters/types';
import type { PanelInsets } from './usePanelInsets';

/** Roughly Switzerland, where the SAC huts are. */
const SWITZERLAND: AreaBounds = [
  [45.82, 5.96],
  [47.81, 10.49]
];

type Props = {
  /** Area from the url, if any; otherwise the view fits Switzerland. */
  areaBounds: AreaBounds | null;
  getInsets: () => PanelInsets;
};

/** On load, fits the huts (or the selected area) into the part of the map the panels leave free. */
export function MapInitialView({ areaBounds, getInsets }: Props) {
  const map = useMap();

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const { right, bottom } = getInsets();
      map.fitBounds(L.latLngBounds(areaBounds ?? SWITZERLAND), {
        paddingTopLeft: [12, 12],
        paddingBottomRight: [right + 12, bottom + 12],
        animate: false
      });
    });
    return () => cancelAnimationFrame(frame);
    // only once, on load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}
