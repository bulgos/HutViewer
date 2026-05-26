import { CircleMarker, Popup } from 'react-leaflet';
import type { HutType } from '../hut-data/HutType';
import { currentMonthOpening, openingMarkerPathOptions } from '../hut-data/openingStatus';

type Props = {
  huts: HutType[];
  hoveredHutId: number | null;
  onMarkerSelect: (hut: HutType) => void;
};

export function HutMapMarkers({ huts, hoveredHutId, onMarkerSelect }: Props) {
  return (
    <>
      {huts.map((hut) => {
        const opening = currentMonthOpening(hut);
        const highlighted = hut.id === hoveredHutId;
        const base = openingMarkerPathOptions(opening);
        const pathOptions = highlighted ? { ...base, weight: 3, fillOpacity: 1 } : base;
        const radius = 7;

        return (
          <CircleMarker
            key={hut.location.join(',')}
            center={hut.location}
            radius={radius}
            pathOptions={pathOptions}
            eventHandlers={{
              click: () => onMarkerSelect(hut),
            }}
          >
            <Popup>{hut.geographical_name}</Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
