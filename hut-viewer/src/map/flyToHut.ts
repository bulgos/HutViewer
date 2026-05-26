import L from 'leaflet';

const MAP_EDGE_PAD = 16;

/**
 * Centers the hut in the map region not covered by right-hand panels.
 * `paddingRightPx` = width from the panels' left edge to the viewport's right edge.
 */
export function flyToHutVisible(
  map: L.Map,
  latlng: L.LatLngExpression,
  zoom: number,
  paddingRightPx: number,
): void {
  const target = L.latLng(latlng);
  const size = map.getSize();
  const visibleCenterX = (size.x - paddingRightPx) / 2;
  const offset = L.point(visibleCenterX - size.x / 2, 0);

  const targetPoint = map.project(target, zoom);
  const center = map.unproject(targetPoint.subtract(offset), zoom);

  map.stop();
  map.setView(center, zoom, { animate: false });
}

export { MAP_EDGE_PAD };
