import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { Rectangle, useMap } from 'react-leaflet';
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
  const callbacksRef = useRef({ onBoundsChange, onDrawEnd, onDrawRejected });
  useEffect(() => {
    callbacksRef.current = { onBoundsChange, onDrawEnd, onDrawRejected };
  });

  useEffect(() => {
    if (!drawActive) {
      anchorRef.current = null;
      setDraftBounds(null);
      return;
    }
    map.dragging.disable();
    map.touchZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();
    const container = map.getContainer();
    container.style.cursor = 'crosshair';
    container.style.touchAction = 'none';

    // pointer events, so drawing works with a mouse and with a finger
    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary || (e.target as Element).closest('.leaflet-control')) return;
      e.preventDefault();
      e.stopPropagation();
      container.setPointerCapture(e.pointerId);
      const latlng = map.mouseEventToLatLng(e);
      anchorRef.current = latlng;
      setDraftBounds(cornersToBounds(latlng, latlng));
    };
    const onMove = (e: PointerEvent) => {
      const anchor = anchorRef.current;
      if (!anchor || !e.isPrimary) return;
      e.stopPropagation();
      setDraftBounds(cornersToBounds(anchor, map.mouseEventToLatLng(e)));
    };
    const onUp = (e: PointerEvent) => {
      const anchor = anchorRef.current;
      if (!anchor || !e.isPrimary) return;
      e.stopPropagation();
      const { onBoundsChange, onDrawEnd, onDrawRejected } = callbacksRef.current;
      const normalized = normalizeAreaBounds(anchor, map.mouseEventToLatLng(e));
      if (normalized) {
        onBoundsChange(normalized);
      } else {
        onDrawRejected?.();
      }
      anchorRef.current = null;
      setDraftBounds(null);
      onDrawEnd();
    };

    container.addEventListener('pointerdown', onDown, true);
    container.addEventListener('pointermove', onMove, true);
    container.addEventListener('pointerup', onUp, true);
    return () => {
      container.removeEventListener('pointerdown', onDown, true);
      container.removeEventListener('pointermove', onMove, true);
      container.removeEventListener('pointerup', onUp, true);
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      container.style.cursor = '';
      container.style.touchAction = '';
    };
  }, [drawActive, map]);

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
