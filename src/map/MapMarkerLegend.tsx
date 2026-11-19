import { useState } from 'react';
import { AVAILABILITY_MARKER_PALETTE, type AvailabilityStatus } from '../hut-data/hut-availability';
import { OPENING_LABEL, OPENING_MARKER_PALETTE } from '../hut-data/openingStatus';
import type { OpeningType } from '../hut-data/HutType';
import '../filters/HutFilters.css';
import './MapMarkerLegend.css';

const AVAILABILITY_LEGEND: { status: AvailabilityStatus; label: string }[] = [
  { status: 'full', label: 'Full (≥99%)' },
  { status: 'nearly-full', label: 'Nearly full (≥70%)' },
  { status: 'half-full', label: 'Half full (≥40%)' },
  { status: 'low', label: 'Low (≥1%)' },
  { status: 'empty', label: 'All beds free' }
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

/** The two marker lists; used in the floating legend and in the phone sheet. */
export const MapLegendBody = () => (
  <>
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
      <p className="hut-filters__hint">Faded: no bed data for the date.</p>
      <ul className="map-legend__list">
        {OPENING_LEGEND.map((kind) => {
          const { fill, stroke } = OPENING_MARKER_PALETTE[kind];
          return <LegendRow key={kind} fill={fill} stroke={stroke} label={OPENING_LABEL[kind]} dimmed />;
        })}
      </ul>
    </fieldset>
  </>
);

/** Floating legend, desktop only (on phones the legend is a tab in the sheet). */
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
      <button
        type="button"
        className="hut-panel__chrome"
        onClick={toggleLegend}
        aria-expanded={open}
        aria-controls="map-marker-legend-body"
      >
        <svg className="hut-panel__chevron" viewBox="0 0 16 16" width="14" height="14" aria-hidden focusable="false">
          <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="hut-panel__rail-label">Legend</span>
      </button>
      <div className="hut-panel__expandable">
        <div id="map-marker-legend-body" className="hut-panel__expandable-inner map-legend__body hut-filters">
          <MapLegendBody />
        </div>
      </div>
    </aside>
  );
};
