import type { PathOptions } from 'leaflet';
import type { HutType, OpeningType } from './HutType';

/** Abbreviations aligned with `hut.openings` index (Jan = 0 … Dec = 11) */
export const CALENDAR_MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const OPENING_LABEL: Record<OpeningType, string> = {
  closed: 'Closed',
  open: 'Open',
  serviced: 'Serviced',
};

export type OpeningVisualKind = OpeningType | 'unknown';

export function calendarMonthIndex(date: Date = new Date()): number {
  return date.getMonth();
}

export function openingAtCalendarMonth(
  hut: HutType,
  monthIndex: number,
): OpeningType | undefined {
  return hut.openings[monthIndex];
}

/** Opening for the hut in the user’s current calendar month (local timezone). */
export function currentMonthOpening(
  hut: HutType,
  date: Date = new Date(),
): OpeningType | undefined {
  return openingAtCalendarMonth(hut, calendarMonthIndex(date));
}

export function openingVisualKind(opening: OpeningType | undefined): OpeningVisualKind {
  return opening ?? 'unknown';
}

/**
 * Colours aligned with HutCard “this month” pill and season legend
 * (accent purple light theme #aa3bff; open green; closed slate).
 */
const MARKER_PALETTE: Record<OpeningVisualKind, { fill: string; stroke: string }> = {
  closed: { fill: '#94a3b8', stroke: '#64748b' },
  open: { fill: '#22c55e', stroke: '#15803d' },
  serviced: { fill: '#aa3bff', stroke: '#7c3aed' },
  unknown: { fill: '#a8a29e', stroke: '#78716c' },
};

export function openingMarkerPathOptions(opening: OpeningType | undefined): PathOptions {
  const { fill, stroke } = MARKER_PALETTE[openingVisualKind(opening)];
  return {
    fillColor: fill,
    color: stroke,
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9,
  };
}
