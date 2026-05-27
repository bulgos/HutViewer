import type { CircleMarker as LeafletCircleMarker, LeafletMouseEvent } from 'leaflet';
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

function showMarkerTooltip(e: LeafletMouseEvent, label: string) {
  const layer = e.target as LeafletCircleMarker;
  layer.unbindTooltip();
  layer.bindTooltip(label, TOOLTIP_OPTIONS).openTooltip();
}

function hideMarkerTooltip(e: LeafletMouseEvent) {
  const layer = e.target as LeafletCircleMarker;
  layer.closeTooltip();
  layer.unbindTooltip();
}

export function HutMapMarkers({ huts, onMarkerSelect }: Props) {
  const { hoveredHutId, hoverHut, unhoverHut } = useHutHover();

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
            center={hut.location}
            radius={radius}
            pathOptions={pathOptions}
            eventHandlers={{
              mouseover: (e) => {
                e.target.bringToFront?.();
                showMarkerTooltip(e, hut.geographical_name);
                hoverHut(hut.id);
              },
              mouseout: (e) => {
                hideMarkerTooltip(e);
                unhoverHut();
              },
              click: () => onMarkerSelect(hut),
            }}
          />
        );
      })}
    </>
  );
}
