import L from 'leaflet';
import type { PanelInsets } from './usePanelInsets';

const MAP_EDGE_PAD = 16;

/**
 * Centers the hut in the part of the map not covered by the panels.
 * With `onlyIfHidden`, keeps the view when the hut is already visible there.
 */
export function flyToHutVisible(
  map: L.Map,
  latlng: L.LatLngExpression,
  zoom: number,
  insets: PanelInsets,
  onlyIfHidden = false,
): void {
  const target = L.latLng(latlng);
  const size = map.getSize();
  const visibleW = size.x - insets.right;
  const visibleH = size.y - insets.bottom;

  if (onlyIfHidden) {
    const p = map.latLngToContainerPoint(target);
    const inside =
      p.x >= MAP_EDGE_PAD && p.x <= visibleW - MAP_EDGE_PAD && p.y >= MAP_EDGE_PAD && p.y <= visibleH - MAP_EDGE_PAD;
    if (inside) return;
  }

  const offset = L.point(visibleW / 2 - size.x / 2, visibleH / 2 - size.y / 2);
  const targetPoint = map.project(target, zoom);
  const center = map.unproject(targetPoint.subtract(offset), zoom);

  map.stop();
  map.setView(center, zoom, { animate: onlyIfHidden });
}

export { MAP_EDGE_PAD };
