import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllInformation } from './api/get-hut-data/api';
import { applyHutFilters, applyHutFiltersWithoutAvailability } from './filters/applyHutFilters';
import { HutFilters } from './filters/HutFilters';
import { DEFAULT_HUT_FILTERS, filtersNeedAvailability, type HutFilterState } from './filters/types';
import { useAvailabilityPrefetch } from './filters/useAvailabilityPrefetch';
import { type HutType } from './hut-data/HutType';
import { HutList } from './hut-data/HutList';
import { AreaSelector } from './map/AreaSelector';
import { HutMapMarkers } from './map/HutMapMarkers';

function App() {
  const [huts, setHuts] = useState<HutType[]>([]);
  const [filters, setFilters] = useState<HutFilterState>(DEFAULT_HUT_FILTERS);
  const [drawAreaActive, setDrawAreaActive] = useState(false);
  const [areaDrawHint, setAreaDrawHint] = useState<string | null>(null);
  const [hoveredHutId, setHoveredHutId] = useState<number | null>(null);
  const [detailsOpenByHutId, setDetailsOpenByHutId] = useState<Record<number, boolean>>({});

  const hutsBeforeAvailability = useMemo(
    () => applyHutFiltersWithoutAvailability(huts, filters),
    [huts, filters],
  );

  const needAvailability = filtersNeedAvailability(filters);
  const { availabilityByHutId, loading: availabilityLoading } = useAvailabilityPrefetch(
    hutsBeforeAvailability,
    needAvailability,
  );

  const filteredHuts = useMemo(
    () => applyHutFilters(huts, filters, availabilityByHutId),
    [huts, filters, availabilityByHutId],
  );

  useEffect(() => {
    fetchAllInformation().then(setHuts);
  }, []);

  const handleMarkerSelect = useCallback((hut: HutType) => {
    setDetailsOpenByHutId((prev) => ({ ...prev, [hut.id]: true }));
    requestAnimationFrame(() => {
      document.getElementById(`hut-card-${hut.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  }, []);

  const handleDetailsOpenChange = useCallback((hutId: number, open: boolean) => {
    setDetailsOpenByHutId((prev) => ({ ...prev, [hutId]: open }));
  }, []);

  return (
    <section id="center">
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={[47, 8]}
        zoom={7}
        scrollWheelZoom={!drawAreaActive}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <AreaSelector
          bounds={filters.areaBounds}
          drawActive={drawAreaActive}
          onBoundsChange={(areaBounds) => {
            setAreaDrawHint(null);
            setFilters((f) => ({ ...f, areaBounds }));
          }}
          onDrawEnd={() => setDrawAreaActive(false)}
          onDrawRejected={() =>
            setAreaDrawHint('Area too small — drag a larger rectangle on the map.')
          }
        />
        <HutMapMarkers
          huts={filteredHuts}
          hoveredHutId={hoveredHutId}
          onMarkerSelect={handleMarkerSelect}
        />
      </MapContainer>
      {drawAreaActive && (
        <div className="map-draw-hint" role="status">
          Drag on the map to mark the search area
        </div>
      )}
      {areaDrawHint && !drawAreaActive && (
        <div className="map-draw-hint map-draw-hint--warn" role="status">
          {areaDrawHint}
        </div>
      )}
      <div className="hut-panels">
        <aside className="hut-panel hut-panel--results" aria-label="Hut results">
          <header className="hut-results__head">
            <h2 className="hut-results__title">Results</h2>
            <span className="hut-results__count">
              {filteredHuts.length} / {huts.length}
            </span>
          </header>
          <HutList
            huts={filteredHuts}
            hoveredHutId={hoveredHutId}
            onHoverHut={setHoveredHutId}
            detailsOpenByHutId={detailsOpenByHutId}
            onDetailsOpenChange={handleDetailsOpenChange}
          />
        </aside>
        <aside className="hut-panel hut-panel--filters" aria-label="Hut filters">
          <HutFilters
            filters={filters}
            onChange={setFilters}
            drawAreaActive={drawAreaActive}
            onDrawAreaToggle={() => {
              setAreaDrawHint(null);
              setDrawAreaActive((v) => !v);
            }}
            onClearArea={() => setFilters((f) => ({ ...f, areaBounds: null }))}
            availabilityLoading={needAvailability && availabilityLoading}
            availabilityTargetCount={hutsBeforeAvailability.filter((h) => !h.is_private).length}
            onResetAll={() => {
              setFilters(DEFAULT_HUT_FILTERS);
              setDrawAreaActive(false);
              setAreaDrawHint(null);
            }}
          />
        </aside>
      </div>
    </section>
  );
}

export default App;
