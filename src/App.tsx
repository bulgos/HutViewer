import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './App.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { applyHutFilters, applyHutFiltersWithoutAvailability } from './filters/applyHutFilters';
import { filtersNeedAvailability, filtersUseAvailabilityMap } from './filters/types';
import { HutDatePanel } from './filters/HutDatePanel';
import { HutFilters } from './filters/HutFilters';
import { DEFAULT_HUT_FILTERS, type HutFilterState } from './filters/types';
import { getInitialFiltersFromUrl, useFilterUrlSync } from './filters/useFilterUrlSync';
import { HutHoverProvider } from './hut-data/HutHoverContext';
import { loadHutsWithAvailability } from './hut-data/loadHutsWithAvailability';
import { useBatchedAvailabilityUpdates } from './hut-data/useBatchedAvailabilityUpdates';
import { type HutType } from './hut-data/HutType';
import { HutList } from './hut-data/HutList';
import { AreaSelector } from './map/AreaSelector';
import { HutMapMarkers } from './map/HutMapMarkers';
import { MapFlyToHut } from './map/MapFlyToHut';
import { useRightPanelWidth } from './map/useRightPanelWidth';

function App() {
  const [huts, setHuts] = useState<HutType[]>([]);
  const [filters, setFilters] = useState<HutFilterState>(getInitialFiltersFromUrl);
  const [drawAreaActive, setDrawAreaActive] = useState(false);
  const [areaDrawHint, setAreaDrawHint] = useState<string | null>(null);
  const [detailsOpenByHutId, setDetailsOpenByHutId] = useState<Record<number, boolean>>({});
  const [resultsOpen, setResultsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapFocusHut, setMapFocusHut] = useState<HutType | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const { availabilityByHutId, scheduleBatch } = useBatchedAvailabilityUpdates();

  const setFiltersTransition = useCallback((update: HutFilterState | ((prev: HutFilterState) => HutFilterState)) => {
    startTransition(() => {
      setFilters(update);
    });
  }, []);

  useFilterUrlSync(filters, setFiltersTransition);

  const panelsRef = useRef<HTMLDivElement>(null);
  const mapPaddingRight = useRightPanelWidth(panelsRef);

  const hutsBeforeAvailability = useMemo(() => applyHutFiltersWithoutAvailability(huts, filters), [huts, filters]);

  const needAvailability = filtersNeedAvailability(filters);
  const useAvailabilityMap = filtersUseAvailabilityMap(filters);
  const filteredHuts = useMemo(
    () =>
      useAvailabilityMap
        ? applyHutFilters(huts, filters, availabilityByHutId)
        : applyHutFiltersWithoutAvailability(huts, filters),
    [huts, filters, useAvailabilityMap, useAvailabilityMap ? availabilityByHutId : null],
  );

  const mapHuts = useAvailabilityMap ? filteredHuts : hutsBeforeAvailability;

  const availabilityTargetCount = useMemo(
    () => hutsBeforeAvailability.filter((h) => !h.is_private).length,
    [hutsBeforeAvailability],
  );

  useEffect(() => {
    let cancelled = false;
    setAvailabilityLoading(true);

    void loadHutsWithAvailability(
      (loaded) => {
        if (cancelled) return;
        setHuts(loaded);
      },
      (batch) => {
        if (cancelled) return;
        scheduleBatch(batch);
      },
      () => cancelled,
    ).finally(() => {
      if (!cancelled) setAvailabilityLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [scheduleBatch]);

  const handleMarkerSelect = useCallback((hut: HutType) => {
    flushSync(() => {
      setDetailsOpenByHutId((prev) => ({ ...prev, [hut.id]: true }));
      setResultsOpen(true);
    });

    const scrollToCard = () => {
      document.getElementById(`hut-card-${hut.id}`)?.scrollIntoView({
        behavior: 'auto',
        block: 'nearest',
      });
    };

    scrollToCard();
    // Re-scroll once after expanded card layout is painted.
    requestAnimationFrame(scrollToCard);
  }, []);

  const handleShowHutOnMap = useCallback((hut: HutType) => {
    setMapFocusHut(hut);
  }, []);

  const handleDetailsOpenChange = useCallback((hutId: number, open: boolean) => {
    setDetailsOpenByHutId((prev) => ({ ...prev, [hutId]: open }));
  }, []);

  return (
    <HutHoverProvider>
      <section id="center">
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          center={[47, 8]}
          zoom={7}
          scrollWheelZoom={!drawAreaActive}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxNativeZoom={19}
            detectRetina
          />
          <AreaSelector
            bounds={filters.areaBounds}
            drawActive={drawAreaActive}
            onBoundsChange={(areaBounds) => {
              setAreaDrawHint(null);
              setFiltersTransition((f) => ({ ...f, areaBounds }));
            }}
            onDrawEnd={() => setDrawAreaActive(false)}
            onDrawRejected={() => setAreaDrawHint('Area too small — drag a larger rectangle on the map.')}
          />
          <MapFlyToHut hut={mapFocusHut} paddingRightPx={mapPaddingRight} />
          <HutMapMarkers
            huts={mapHuts}
            availabilityByHutId={availabilityByHutId}
            availabilityDate={filters.availabilityDate}
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
        <div className="hut-panels" ref={panelsRef}>
          <aside className={`hut-panel hut-panel--date`} aria-label="Search date">
            <div className="hut-panel__chrome">
              <HutDatePanel
                value={filters.availabilityDate}
                onChange={(availabilityDate) => setFiltersTransition((f) => ({ ...f, availabilityDate }))}
              />
            </div>
          </aside>
          <aside
            className={`hut-panel hut-panel--filters${filtersOpen ? '' : ' hut-panel--collapsed'}`}
            aria-label="Hut filters"
          >
            <div className="hut-panel__chrome">
              <button
                type="button"
                className="hut-panel__toggle"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersOpen}
                aria-label={filtersOpen ? 'Collapse filters' : 'Expand filters'}
                title={filtersOpen ? 'Collapse filters' : 'Expand filters'}
              >
                {filtersOpen ? '▲' : '▼'}
              </button>
              <span className="hut-panel__rail-label">Filters</span>
            </div>
            {filtersOpen && (
              <HutFilters
                filters={filters}
                onChange={setFiltersTransition}
                drawAreaActive={drawAreaActive}
                onDrawAreaToggle={() => {
                  setAreaDrawHint(null);
                  setDrawAreaActive((v) => !v);
                }}
                onClearArea={() => setFiltersTransition((f) => ({ ...f, areaBounds: null }))}
                availabilityLoading={needAvailability && availabilityLoading}
                availabilityTargetCount={availabilityTargetCount}
                onResetAll={() => {
                  setFiltersTransition(DEFAULT_HUT_FILTERS);
                  setDrawAreaActive(false);
                  setAreaDrawHint(null);
                }}
              />
            )}
          </aside>
          <aside
            className={`hut-panel hut-panel--results${resultsOpen ? '' : ' hut-panel--collapsed'}`}
            aria-label="Hut results"
          >
            <div className="hut-panel__chrome">
              <button
                type="button"
                className="hut-panel__toggle"
                onClick={() => setResultsOpen((open) => !open)}
                aria-expanded={resultsOpen}
                aria-label={resultsOpen ? 'Collapse results' : 'Expand results'}
                title={resultsOpen ? 'Collapse results' : 'Expand results'}
              >
                {resultsOpen ? '▲' : '▼'}
              </button>
              <span className="hut-panel__rail-label">Results</span>
              <span className="hut-panel__rail-count">
                {filteredHuts.length} / {huts.length}
              </span>
            </div>
            {resultsOpen && (
              <HutList
                huts={filteredHuts}
                availabilityByHutId={availabilityByHutId}
                onShowOnMap={handleShowHutOnMap}
                detailsOpenByHutId={detailsOpenByHutId}
                onDetailsOpenChange={handleDetailsOpenChange}
              />
            )}
          </aside>
        </div>
      </section>
    </HutHoverProvider>
  );
}

export default App;
