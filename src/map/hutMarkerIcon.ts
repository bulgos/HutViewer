import L from 'leaflet';
import type { PathOptions } from 'leaflet';

export function hutMarkerSquareIcon(pathOptions: PathOptions, sizePx: number): L.DivIcon {
  const fill = pathOptions.fillColor ?? '#94a3b8';
  const stroke = pathOptions.color ?? '#64748b';
  const weight = pathOptions.weight ?? 2;
  const opacity = (pathOptions.opacity ?? 1) * (pathOptions.fillOpacity ?? 0.9);

  return L.divIcon({
    className: 'hut-marker-icon hut-marker-icon--refuge',
    html: `<span class="hut-marker-icon__square" style="width:${sizePx}px;height:${sizePx}px;background-color:${fill};border:${weight}px solid ${stroke};opacity:${opacity}"></span>`,
    iconSize: [sizePx, sizePx],
    iconAnchor: [sizePx / 2, sizePx / 2]
  });
}
