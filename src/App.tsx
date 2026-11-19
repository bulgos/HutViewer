import { startTransition, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
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
import { MapFlyToHut, type MapFocusRequest } from './map/MapFlyToHut';
import { MapInitialView } from './map/MapInitialView';
import { MapLegendBody, MapMarkerLegend } from './map/MapMarkerLegend';
import { usePanelInsets } from './map/usePanelInsets';
import { useSheetSnap } from './map/useSheetSnap';
import { HutViewerLogo } from './brand/HutViewerLogo';
import { MOBILE_QUERY, useMediaQuery } from './useMediaQuery';

type MobileTab = 'filters' | 'results' | 'legend' | 'hut';

const Chevron = () => (
  <svg className="hut-panel__chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
    <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function App() {
  const [huts, setHuts] = useState<HutType[]>([]);
  const [filters, setFilters] = useState<HutFilterState>(getInitialFiltersFromUrl);
  const [drawAreaActive, setDrawAreaActive] = useState(false);
  const [areaDrawHint, setAreaDrawHint] = useState<string | null>(null);
  const [selectedHutId, setSelectedHutId] = useState<number | null>(null);
  const [resultsOpen, setResultsOpen] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>('results');
  const [mapFocus, setMapFocus] = useState<MapFocusRequest | null>(null);
  const isMobile = useMediaQuery(MOBILE_QUERY);
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
  const sheetHeaderRef = useRef<HTMLDivElement>(null);
  const sheet = useSheetSnap(sheetHeaderRef);
  const { setSnap: setSheetSnap } = sheet;
  const getInsets = usePanelInsets(panelsRef, isMobile, sheet.getSettledHeight);

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


  const showAvailabilityProgress =
    availabilityLoading || (availabilityProgress.total > 0 && availabilityProgress.loaded < availabilityProgress.total);

  const selectedHut = useMemo(
    () => (selectedHutId === null ? null : huts.find((h) => h.id === selectedHutId) ?? null),
    [huts, selectedHutId]
  );

  // the hut tab keeps its last label while it animates closed
  const [tabHut, setTabHut] = useState<HutType | null>(null);
  if (selectedHut && selectedHut !== tabHut) setTabHut(selectedHut);

  const requestMapFocus = useCallback((hut: HutType, keepZoom: boolean) => {
    setMapFocus((prev) => ({ hut, keepZoom, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  const handleSelectHut = useCallback(
    (hut: HutType) => {
      setSelectedHutId(hut.id);
      // on a phone the hut tab covers the lower half; keep the hut in view above it
      if (isMobile) {
        setMobileTab('hut');
        setSheetSnap('middle');
        requestMapFocus(hut, true);
      }
    },
    [isMobile, requestMapFocus, setSheetSnap]
  );

  const handleMarkerSelect = useCallback(
    (hut: HutType) => {
      flushSync(() => {
        setSelectedHutId(hut.id);
        if (isMobile) {
          setMobileTab('hut');
          setSheetSnap('middle');
        }
      });

      if (isMobile) {
        requestMapFocus(hut, true);
        return;
      }

      if (!resultsOpen) return;

      requestAnimationFrame(() => {
        document.getElementById(`hut-card-${hut.id}`)?.scrollIntoView({
          behavior: 'auto',
          block: 'nearest'
        });
      });
    },
    [isMobile, resultsOpen, requestMapFocus, setSheetSnap]
  );

  const handleShowHutOnMap = useCallback(
    (hut: HutType) => {
      if (isMobile) {
        setSelectedHutId(hut.id);
        setMobileTab('hut');
        setSheetSnap('middle');
      }
      requestMapFocus(hut, false);
    },
    [isMobile, requestMapFocus, setSheetSnap]
  );

  const handleCloseHutDetails = useCallback(() => {
    setSelectedHutId(null);
    setMobileTab((current) => (current === 'hut' ? 'results' : current));
  }, []);

  // a tab opens the sheet to half height; the active tab again lowers it
  const handleMobileTab = useCallback(
    (tab: MobileTab) => {
      if (tab === mobileTab && sheet.snap !== 'bottom') {
        setSheetSnap('bottom');
        return;
      }
      setMobileTab(tab);
      if (sheet.snap === 'bottom') setSheetSnap('middle');
    },
    [mobileTab, sheet.snap, setSheetSnap]
  );

  const showHutDetail = isMobile ? mobileTab === 'hut' : selectedHut !== null;

  const filtersExpanded = isMobile ? mobileTab === 'filters' : filtersOpen;
  const resultsExpanded = isMobile ? mobileTab === 'results' : resultsOpen;

  const resultsCount = (
    <span className="hut-panel__rail-count">
      {filteredHuts.length} / {huts.length}
    </span>
  );

  return (
    <HutHoverProvider>
      <section id="center">
        <MapContainer
          style={{ height: '100%', width: '100%' }}
          center={[47, 8]}
          zoom={7}
          zoomSnap={0.5}
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
          <MapInitialView areaBounds={filters.areaBounds} getInsets={getInsets} />
          <MapFlyToHut request={mapFocus} getInsets={getInsets} />
          <HutMapMarkers
            huts={mapHuts}
            availabilityByHutId={availabilityByHutId}
            availabilityDate={filters.availabilityDate}
            selectedHutId={selectedHutId}
            onMarkerSelect={handleMarkerSelect}
          />
        </MapContainer>
        {!isMobile && <MapMarkerLegend />}
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
        <div
          className={`hut-panels-column${showHutDetail ? ' hut-panels-column--detail' : ''}`}
          ref={panelsRef}
        >
          <div
            className="hut-sheet-header"
            ref={sheetHeaderRef}
            {...(isMobile ? sheet.dragHandlers : {})}
          >
          <button
            type="button"
            className="hut-sheet-handle"
            aria-label={`Sheet height: ${sheet.snap}. Tap to change.`}
          />
          <header className="hut-panel hut-brand">
            <div className="hut-brand__row">
              <HutViewerLogo className="hut-brand__logo" size={22} />
              <h1 className="hut-brand__title">Hut Viewer</h1>
              <HutDatePanel
                value={filters.availabilityDate}
                onChange={(availabilityDate) => setFiltersTransition((f) => ({ ...f, availabilityDate }))}
              />
            </div>
            {showAvailabilityProgress && (
              <AvailabilityLoadProgress loaded={availabilityProgress.loaded} total={availabilityProgress.total} />
            )}
            <div className="hut-tabs" role="tablist" aria-label="Panels">
              <button
                type="button"
                role="tab"
                className="hut-tabs__tab"
                aria-selected={mobileTab === 'filters'}
                onClick={() => handleMobileTab('filters')}
              >
                Filters
              </button>
              <button
                type="button"
                role="tab"
                className="hut-tabs__tab"
                aria-selected={mobileTab === 'results'}
                onClick={() => handleMobileTab('results')}
              >
                Results <span className="hut-tabs__count">{filteredHuts.length}</span>
              </button>
              <button
                type="button"
                role="tab"
                className="hut-tabs__tab"
                aria-selected={mobileTab === 'legend'}
                onClick={() => handleMobileTab('legend')}
              >
                Legend
              </button>
              <button
                type="button"
                role="tab"
                className={`hut-tabs__tab hut-tabs__tab--hut${selectedHut ? ' hut-tabs__tab--shown' : ''}`}
                aria-selected={mobileTab === 'hut'}
                aria-hidden={!selectedHut}
                tabIndex={selectedHut ? 0 : -1}
                title={tabHut?.geographical_name}
                onClick={() => handleMobileTab('hut')}
              >
                <span className="hut-tabs__label">{tabHut?.geographical_name}</span>
              </button>
            </div>
          </header>
          </div>
          <div
            className={`hut-sheet-body${sheet.dragging ? ' hut-sheet-body--dragging' : ''}`}
            style={isMobile ? ({ '--sheet-content-h': `${sheet.contentHeight}px` } as CSSProperties) : undefined}
          >
          <div className="hut-panels">
            <aside
              className={`hut-panel hut-panel--filters${filtersExpanded ? '' : ' hut-panel--collapsed'}`}
              aria-label="Hut filters"
            >
              <button
                type="button"
                className="hut-panel__chrome"
                onClick={() => setFiltersOpen((open) => !open)}
                aria-expanded={filtersExpanded}
              >
                <Chevron />
                <span className="hut-panel__rail-label">Filters</span>
              </button>
              <div className="hut-panel__expandable">
                <div className="hut-panel__expandable-inner">
                  <HutFilters
                    filters={filters}
                    onChange={setFiltersTransition}
                    drawAreaActive={drawAreaActive}
                    onDrawAreaToggle={() => {
                      setAreaDrawHint(null);
                      setDrawAreaActive((v) => {
                        // on a phone, get the sheet out of the way while drawing
                        if (!v && isMobile) setSheetSnap('bottom');
                        return !v;
                      });
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
              className={`hut-panel hut-panel--results${resultsExpanded ? '' : ' hut-panel--collapsed'}`}
              aria-label="Hut results"
            >
              <button
                type="button"
                className="hut-panel__chrome"
                onClick={() => setResultsOpen((open) => !open)}
                aria-expanded={resultsExpanded}
              >
                <Chevron />
                <span className="hut-panel__rail-label">Results</span>
                {resultsCount}
              </button>
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
            {isMobile && (
              <aside
                className={`hut-panel hut-panel--legend${mobileTab === 'legend' ? '' : ' hut-panel--collapsed'}`}
                aria-label="Map legend"
              >
                <div className="hut-panel__expandable">
                  <div className="hut-panel__expandable-inner hut-filters map-legend__body">
                    <MapLegendBody />
                  </div>
                </div>
              </aside>
            )}
          </div>
          <HutDetailAsidePanel
            hut={showHutDetail ? selectedHut : null}
            availabilityByHutId={availabilityByHutId}
            availabilityDate={filters.availabilityDate}
            onClose={handleCloseHutDetails}
          />
          </div>
        </div>
      </section>
    </HutHoverProvider>
  );
}

export default App;
