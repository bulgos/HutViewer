import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import './App.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { applyHutFilters, applyHutFiltersWithoutAvailability } from './filters/applyHutFilters';
import { filtersNeedAvailability, filtersUseAvailabilityMap } from './filters/types';
import { AvailabilityLoadProgress } from './filters/AvailabilityLoadProgress';
import { HutDatePanel } from './filters/HutDatePanel';
import { HutFilters } from './filters/HutFilters';
import { DEFAULT_HUT_FILTERS, type HutFilterState } from './filters/types';
import { getInitialFiltersFromUrl, useFilterUrlSync } from './filters/useFilterUrlSync';
import { HutHoverProvider } from './hut-data/HutHoverContext';
import { loadHutsWithAvailability } from './hut-data/loadHutsWithAvailability';
import { useBatchedAvailabilityUpdates } from './hut-data/useBatchedAvailabilityUpdates';
import { type HutType } from './hut-data/HutType';
import { HutDetailAsidePanel } from './hut-data/HutDetailAside';
import { HutList } from './hut-data/HutList';
import { AreaSelector } from './map/AreaSelector';
import { HutMapMarkers } from './map/HutMapMarkers';
import { MapFlyToHut } from './map/MapFlyToHut';
import { MapMarkerLegend } from './map/MapMarkerLegend';
import { useRightPanelWidth } from './map/useRightPanelWidth';

function App() {
  const [huts, setHuts] = useState<HutType[]>([]);
  const [filters, setFilters] = useState<HutFilterState>(getInitialFiltersFromUrl);
  const [drawAreaActive, setDrawAreaActive] = useState(false);
  const [areaDrawHint, setAreaDrawHint] = useState<string | null>(null);
  const [selectedHutId, setSelectedHutId] = useState<number | null>(null);
  const [resultsOpen, setResultsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mapFocusHut, setMapFocusHut] = useState<HutType | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityProgress, setAvailabilityProgress] = useState({ loaded: 0, total: 0 });
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
    [huts, filters, useAvailabilityMap, useAvailabilityMap ? availabilityByHutId : null]
  );

  const mapHuts = useAvailabilityMap ? filteredHuts : hutsBeforeAvailability;

  const availabilityTargetCount = useMemo(
    () => hutsBeforeAvailability.filter((h) => !h.is_private).length,
    [hutsBeforeAvailability]
  );

  useEffect(() => {
    let cancelled = false;
    setAvailabilityLoading(true);
    setAvailabilityProgress({ loaded: 0, total: 0 });

    void loadHutsWithAvailability(
      (loaded) => {
        if (cancelled) return;
        setHuts(loaded);
      },
      (batch) => {
        if (cancelled) return;
        scheduleBatch(batch);
      },
      (loaded, total) => {
        if (cancelled) return;
        setAvailabilityProgress({ loaded, total });
      },
      () => cancelled,
    ).finally(() => {
      if (!cancelled) setAvailabilityLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [scheduleBatch]);

  console.log([...new Set(huts.map((h) => h.type))]);

  const showAvailabilityProgress =
    availabilityLoading || (availabilityProgress.total > 0 && availabilityProgress.loaded < availabilityProgress.total);

  const selectedHut = useMemo(
    () => (selectedHutId === null ? null : huts.find((h) => h.id === selectedHutId) ?? null),
    [huts, selectedHutId]
  );

  const handleSelectHut = useCallback((hut: HutType) => {
    setSelectedHutId(hut.id);
  }, []);

  const handleMarkerSelect = useCallback(
    (hut: HutType) => {
      flushSync(() => {
        setSelectedHutId(hut.id);
      });

      if (!resultsOpen) return;

      requestAnimationFrame(() => {
        document.getElementById(`hut-card-${hut.id}`)?.scrollIntoView({
          behavior: 'auto',
          block: 'nearest'
        });
      });
    },
    [resultsOpen]
  );

  const handleShowHutOnMap = useCallback((hut: HutType) => {
    setMapFocusHut(hut);
  }, []);

  const handleCloseHutDetails = useCallback(() => {
    setSelectedHutId(null);
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
        <MapMarkerLegend />
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
        <div className="hut-panels-column" ref={panelsRef}>
          <div className="hut-panels">
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
              <HutDatePanel
                value={filters.availabilityDate}
                onChange={(availabilityDate) => setFiltersTransition((f) => ({ ...f, availabilityDate }))}
                trailing={
                  showAvailabilityProgress ? (
                    <AvailabilityLoadProgress loaded={availabilityProgress.loaded} total={availabilityProgress.total} />
                  ) : null
                }
              />
            </div>
            <div className="hut-panel__expandable">
              <div className="hut-panel__expandable-inner">
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
              </div>
            </div>
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
            <div className="hut-panel__expandable">
              <div className="hut-panel__expandable-inner">
                <HutList
                  huts={filteredHuts}
                  selectedHutId={selectedHutId}
                  onSelectHut={handleSelectHut}
                  onShowOnMap={handleShowHutOnMap}
                />
              </div>
            </div>
          </aside>
          </div>
          <HutDetailAsidePanel
            hut={selectedHut}
            availabilityByHutId={availabilityByHutId}
            availabilityDate={filters.availabilityDate}
            onClose={handleCloseHutDetails}
          />
        </div>
      </section>
    </HutHoverProvider>
  );
}

export default App;
