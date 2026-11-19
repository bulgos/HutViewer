import type { CircleMarker as LeafletCircleMarker } from 'leaflet';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { CircleMarker } from 'react-leaflet';
import { getHutAvailability, type AvailabilityByHutId } from '../hut-data/availabilityStore';
import type { HutAvailability } from '../hut-data/hut-availability';
import { useHutHoverActions } from '../hut-data/HutHoverContext';
import type { HutType } from '../hut-data/HutType';
import { useHoveredHutId } from '../hut-data/useHoveredHutId';
import { useIsHutHovered } from '../hut-data/useIsHutHovered';
import { hutMarkerPathOptions } from './markerPathOptions';

const TOOLTIP_OPTIONS = {
  direction: 'top' as const,
  offset: [0, -10] as [number, number],
  opacity: 0.95,
  className: 'hut-marker-tooltip',
};

type Props = {
  huts: HutType[];
  availabilityByHutId: AvailabilityByHutId;
  availabilityDate: string;
  selectedHutId: number | null;
  onMarkerSelect: (hut: HutType) => void;
};

/** Selected marker: an accent ring, so it stays findable on touch screens without hover. */
const SELECTED_RING = { color: '#aa3bff', weight: 4, opacity: 1, fillOpacity: 1 };

type MarkerProps = {
  hut: HutType;
  availability: HutAvailability[];
  availabilityDate: string;
  selected: boolean;
  onMarkerSelect: (hut: HutType) => void;
  registerMarker: (hutId: number, layer: LeafletCircleMarker | null) => void;
};

const HutMapMarkerLayer = memo(function HutMapMarkerLayer({
  hut,
  availability,
  availabilityDate,
  selected,
  onMarkerSelect,
  registerMarker,
}: MarkerProps) {
  const layerRef = useRef<LeafletCircleMarker | null>(null);
  const highlighted = useIsHutHovered(hut.id);
  const { hoverHut, unhoverHut } = useHutHoverActions();

  const pathOptions = useMemo(() => {
    const base = hutMarkerPathOptions(hut, availability, availabilityDate);
    if (selected) return { ...base, ...SELECTED_RING };
    return highlighted ? { ...base, weight: 4, opacity: 1, fillOpacity: 1 } : base;
  }, [hut, availability, availabilityDate, highlighted, selected]);

  const radius = highlighted || selected ? 11 : 7;

  useEffect(() => {
    if (selected) layerRef.current?.bringToFront();
  }, [selected]);

  const eventHandlers = useMemo(
    () => ({
      mouseover: () => hoverHut(hut.id),
      mouseout: () => unhoverHut(),
      click: () => onMarkerSelect(hut),
    }),
    [hut, hoverHut, unhoverHut, onMarkerSelect],
  );

  return (
    <CircleMarker
      ref={(layer) => {
        layerRef.current = layer;
        registerMarker(hut.id, layer);
      }}
      center={hut.location}
      radius={radius}
      pathOptions={pathOptions}
      eventHandlers={eventHandlers}
    />
  );
});

function clearLayerTooltip(layer: LeafletCircleMarker) {
  layer.closeTooltip();
  layer.unbindTooltip();
}

export function HutMapMarkers({ huts, availabilityByHutId, availabilityDate, selectedHutId, onMarkerSelect }: Props) {
  const markerLayersRef = useRef<Map<number, LeafletCircleMarker>>(new Map());
  const hoveredHutId = useHoveredHutId();

  const registerMarker = useCallback((hutId: number, layer: LeafletCircleMarker | null) => {
    const layers = markerLayersRef.current;
    if (layer) {
      layers.set(hutId, layer);
    } else {
      const existing = layers.get(hutId);
      if (existing) clearLayerTooltip(existing);
      layers.delete(hutId);
    }
  }, []);

  useEffect(() => {
    const layers = markerLayersRef.current;
    for (const layer of layers.values()) {
      clearLayerTooltip(layer);
    }

    if (hoveredHutId === null) return;

    const hut = huts.find((h) => h.id === hoveredHutId);
    const layer = layers.get(hoveredHutId);
    if (!hut || !layer) return;

    layer.bringToFront();
    layer.bindTooltip(hut.geographical_name, TOOLTIP_OPTIONS).openTooltip();
  }, [hoveredHutId, huts]);

  if (huts.length === 0) return null;

  return (
    <>
      {huts.map((hut) => (
        <HutMapMarkerLayer
          key={hut.id}
          hut={hut}
          availability={getHutAvailability(hut.id, availabilityByHutId)}
          availabilityDate={availabilityDate}
          selected={hut.id === selectedHutId}
          onMarkerSelect={onMarkerSelect}
          registerMarker={registerMarker}
        />
      ))}
    </>
  );
}
