import type { CircleMarker as LeafletCircleMarker } from 'leaflet';
import { useEffect, useRef } from 'react';
import { CircleMarker } from 'react-leaflet';
import { useHutHover } from '../hut-data/HutHoverContext';
import type { HutType } from '../hut-data/HutType';
import { currentMonthOpening, openingMarkerPathOptions } from '../hut-data/openingStatus';

const TOOLTIP_OPTIONS = {
  direction: 'top' as const,
  offset: [0, -10] as [number, number],
  opacity: 0.95,
  className: 'hut-marker-tooltip',
};

type Props = {
  huts: HutType[];
  onMarkerSelect: (hut: HutType) => void;
};

function clearLayerTooltip(layer: LeafletCircleMarker) {
  layer.closeTooltip();
  layer.unbindTooltip();
}

export function HutMapMarkers({ huts, onMarkerSelect }: Props) {
  const { hoveredHutId, hoverHut, unhoverHut } = useHutHover();
  const markerLayersRef = useRef<Map<number, LeafletCircleMarker>>(new Map());

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

  const registerMarker = (hutId: number, layer: LeafletCircleMarker | null) => {
    const layers = markerLayersRef.current;
    if (layer) {
      layers.set(hutId, layer);
    } else {
      const existing = layers.get(hutId);
      if (existing) clearLayerTooltip(existing);
      layers.delete(hutId);
    }
  };

  return (
    <>
      {huts.map((hut) => {
        const opening = currentMonthOpening(hut);
        const highlighted = hut.id === hoveredHutId;
        const base = openingMarkerPathOptions(opening);
        const pathOptions = highlighted ? { ...base, weight: 4, opacity: 1, fillOpacity: 1 } : base;
        const radius = highlighted ? 11 : 7;

        return (
          <CircleMarker
            key={hut.id}
            ref={(layer) => registerMarker(hut.id, layer)}
            center={hut.location}
            radius={radius}
            pathOptions={pathOptions}
            eventHandlers={{
              mouseover: () => hoverHut(hut.id),
              mouseout: () => unhoverHut(),
              click: () => onMarkerSelect(hut),
            }}
          />
        );
      })}
    </>
  );
}
