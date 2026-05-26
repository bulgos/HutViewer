import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { Rectangle, useMap, useMapEvents } from 'react-leaflet';
import { normalizeAreaBounds } from '../filters/applyHutFilters';
import type { AreaBounds } from '../filters/types';

type Props = {
  bounds: AreaBounds | null;
  drawActive: boolean;
  onBoundsChange: (bounds: AreaBounds | null) => void;
  onDrawEnd: () => void;
  onDrawRejected?: () => void;
};

/** Opposite corners in any drag direction → south-west / north-east for Leaflet. */
function cornersToBounds(
  cornerA: L.LatLng | { lat: number; lng: number },
  cornerB: L.LatLng | { lat: number; lng: number },
): AreaBounds {
  return [
    [Math.min(cornerA.lat, cornerB.lat), Math.min(cornerA.lng, cornerB.lng)],
    [Math.max(cornerA.lat, cornerB.lat), Math.max(cornerA.lng, cornerB.lng)],
  ];
}

export function AreaSelector({
  bounds,
  drawActive,
  onBoundsChange,
  onDrawEnd,
  onDrawRejected,
}: Props) {
  const map = useMap();
  const anchorRef = useRef<L.LatLng | null>(null);
  const [draftBounds, setDraftBounds] = useState<AreaBounds | null>(null);

  useEffect(() => {
    if (!drawActive) {
      anchorRef.current = null;
      setDraftBounds(null);
      return;
    }
    map.dragging.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    const container = map.getContainer();
    container.style.cursor = 'crosshair';
    return () => {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      container.style.cursor = '';
    };
  }, [drawActive, map]);

  useMapEvents({
    mousedown(e) {
      if (!drawActive) return;
      L.DomEvent.stopPropagation(e.originalEvent);
      L.DomEvent.preventDefault(e.originalEvent);
      anchorRef.current = e.latlng;
      setDraftBounds(cornersToBounds(e.latlng, e.latlng));
    },
    mousemove(e) {
      const anchor = anchorRef.current;
      if (!drawActive || !anchor) return;
      L.DomEvent.stopPropagation(e.originalEvent);
      setDraftBounds(cornersToBounds(anchor, e.latlng));
    },
    mouseup(e) {
      const anchor = anchorRef.current;
      if (!drawActive || !anchor) return;
      L.DomEvent.stopPropagation(e.originalEvent);
      const normalized = normalizeAreaBounds(anchor, e.latlng);
      if (normalized) {
        onBoundsChange(normalized);
      } else {
        onDrawRejected?.();
      }
      anchorRef.current = null;
      setDraftBounds(null);
      onDrawEnd();
    },
  });

  const areaStyle = {
    color: '#aa3bff',
    weight: 2,
    fillColor: '#aa3bff',
    fillOpacity: 0.12,
    dashArray: '6 4',
  };

  const displayBounds = drawActive && draftBounds ? draftBounds : bounds;

  return (
    <>
      {displayBounds && (
        <Rectangle bounds={displayBounds} pathOptions={areaStyle} />
      )}
    </>
  );
}
