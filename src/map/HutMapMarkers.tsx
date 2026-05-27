import { CircleMarker, Tooltip } from 'react-leaflet';
import type { HutType } from '../hut-data/HutType';
import { currentMonthOpening, openingMarkerPathOptions } from '../hut-data/openingStatus';

type Props = {
  huts: HutType[];
  hoveredHutId: number | null;
  onMarkerHover: (hutId: number | null) => void;
  onMarkerSelect: (hut: HutType) => void;
};

export function HutMapMarkers({ huts, hoveredHutId, onMarkerHover, onMarkerSelect }: Props) {
  const ordered = [...huts].sort((a, b) => {
    if (a.id === hoveredHutId) return 1;
    if (b.id === hoveredHutId) return -1;
    return 0;
  });

  return (
    <>
      {ordered.map((hut) => {
        const opening = currentMonthOpening(hut);
        const highlighted = hut.id === hoveredHutId;
        const base = openingMarkerPathOptions(opening);
        const pathOptions = highlighted
          ? { ...base, weight: 4, opacity: 1, fillOpacity: 1 }
          : base;
        const radius = highlighted ? 11 : 7;

        return (
          <CircleMarker
            key={hut.id}
            center={hut.location}
            radius={radius}
            pathOptions={pathOptions}
            eventHandlers={{
              mouseover: () => onMarkerHover(hut.id),
              mouseout: () => onMarkerHover(null),
              click: () => onMarkerSelect(hut),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
              {hut.geographical_name}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
