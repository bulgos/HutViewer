import { CircleMarker, Popup, useMap } from 'react-leaflet';
import type { HutType } from '../hut-data/HutType';
import { currentMonthOpening, openingMarkerPathOptions } from '../hut-data/openingStatus';

const SELECT_ZOOM = 12;

type Props = {
  huts: HutType[];
  hoveredHutId: number | null;
  onMarkerSelect: (hut: HutType) => void;
};

export function HutMapMarkers({ huts, hoveredHutId, onMarkerSelect }: Props) {
  const map = useMap();

  return (
    <>
      {huts.map((hut) => {
        const opening = currentMonthOpening(hut);
        const highlighted = hut.id === hoveredHutId;
        const base = openingMarkerPathOptions(opening);
        const pathOptions = highlighted
          ? { ...base, weight: 3, fillOpacity: 1 }
          : base;
        const radius = highlighted ? 11 : 7;

        return (
          <CircleMarker
            key={hut.id}
            center={hut.location}
            radius={radius}
            pathOptions={pathOptions}
            eventHandlers={{
              click: () => {
                map.flyTo(hut.location, SELECT_ZOOM);
                onMarkerSelect(hut);
              },
            }}
          >
            <Popup>{hut.geographical_name}</Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
