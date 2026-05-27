import { useState } from 'react';
import { AVAILABILITY_MARKER_PALETTE, type AvailabilityStatus } from '../hut-data/hut-availability';
import { OPENING_LABEL, OPENING_MARKER_PALETTE } from '../hut-data/openingStatus';
import type { OpeningType } from '../hut-data/HutType';
import '../filters/HutFilters.css';
import './MapMarkerLegend.css';

const AVAILABILITY_LEGEND: { status: AvailabilityStatus; label: string }[] = [
  { status: 'full', label: 'Full (≥99% booked)' },
  { status: 'nearly-full', label: 'Nearly full (≥70%)' },
  { status: 'half-full', label: 'Half full (≥40%)' },
  { status: 'low', label: 'Low (≥1%)' },
  { status: 'empty', label: 'Empty (all beds free)' }
];

const OPENING_LEGEND: OpeningType[] = ['closed', 'open', 'serviced'];

const MAP_LEGEND_DISMISSED_KEY = 'hut-viewer.mapLegendDismissed';

function readLegendDismissed(): boolean {
  try {
    return localStorage.getItem(MAP_LEGEND_DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function persistLegendDismissed(): void {
  try {
    localStorage.setItem(MAP_LEGEND_DISMISSED_KEY, '1');
  } catch {
    // Storage unavailable (private mode, etc.)
  }
}

function LegendSwatch({ fill, stroke }: { fill: string; stroke: string }) {
  return <span className="map-legend__swatch" style={{ backgroundColor: fill, borderColor: stroke }} aria-hidden />;
}

function LegendRow({ fill, stroke, label, dimmed }: { fill: string; stroke: string; label: string; dimmed?: boolean }) {
  return (
    <li className={`map-legend__item${dimmed ? ' map-legend__item--dimmed' : ''}`}>
      <LegendSwatch fill={fill} stroke={stroke} />
      <span>{label}</span>
    </li>
  );
}

export const MapMarkerLegend = () => {
  const [open, setOpen] = useState(() => !readLegendDismissed());

  const toggleLegend = () => {
    setOpen((wasOpen) => {
      if (wasOpen) persistLegendDismissed();
      return !wasOpen;
    });
  };

  return (
    <aside className={`hut-panel map-legend${open ? '' : ' hut-panel--collapsed'}`} aria-label="Map legend">
      <div className="hut-panel__chrome">
        <button
          type="button"
          className="hut-panel__toggle"
          onClick={toggleLegend}
          aria-expanded={open}
          aria-controls="map-marker-legend-body"
          aria-label={open ? 'Collapse legend' : 'Expand legend'}
          title={open ? 'Collapse legend' : 'Expand legend'}
        >
          {open ? '▼' : '▲'}
        </button>
        <span className="hut-panel__rail-label">Legend</span>
      </div>
      <div className="hut-panel__expandable">
        <div id="map-marker-legend-body" className="hut-panel__expandable-inner map-legend__body hut-filters">
          <fieldset className="hut-filters__group">
            <legend className="hut-filters__legend">Bed occupancy</legend>
            <ul className="map-legend__list">
              {AVAILABILITY_LEGEND.map(({ status, label }) => {
                const { fill, stroke } = AVAILABILITY_MARKER_PALETTE[status];
                return <LegendRow key={status} fill={fill} stroke={stroke} label={label} />;
              })}
            </ul>
          </fieldset>
          <fieldset className="hut-filters__group">
            <legend className="hut-filters__legend">Opening (this month)</legend>
            <p className="hut-filters__hint">Used when no bed data for the selected date (50% opacity).</p>
            <ul className="map-legend__list">
              {OPENING_LEGEND.map((kind) => {
                const { fill, stroke } = OPENING_MARKER_PALETTE[kind];
                return <LegendRow key={kind} fill={fill} stroke={stroke} label={OPENING_LABEL[kind]} dimmed />;
              })}
            </ul>
          </fieldset>
        </div>
      </div>
    </aside>
  );
};
