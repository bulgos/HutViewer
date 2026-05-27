import type { PathOptions } from 'leaflet';

export type HutAvailability = {
  date: Date;
  dateFormatted: string;
  freeBeds: number;
  totalSleepingPlaces: number;
};

export type AvailabilityStatus =
  | 'full'
  | 'nearly-full'
  | 'half-full'
  | 'low'
  | 'empty'
  | 'unknown';

export function availabilityLevel(freeBeds: number, totalSleepingPlaces: number): number {
  if (totalSleepingPlaces === 0) return 0;
  return 100 * (1 - freeBeds / totalSleepingPlaces);
}

export function getAvailabilityStatus(percentage: number): AvailabilityStatus {
  if (percentage >= 99) return 'full';
  if (percentage >= 70) return 'nearly-full';
  if (percentage >= 40) return 'half-full';
  if (percentage >= 1) return 'low';
  return 'empty';
}

const AVAILABILITY_MARKER_PALETTE: Record<
  AvailabilityStatus,
  { fill: string; stroke: string }
> = {
  full: { fill: '#ef4444', stroke: '#df1010' },
  'nearly-full': { fill: '#fb923c', stroke: '#f5590b' },
  'half-full': { fill: '#fbbf24', stroke: '#f58c0b' },
  low: { fill: '#fde047', stroke: '#ca8a04' },
  empty: { fill: '#22c55e', stroke: '#16a34a' },
  unknown: { fill: '#94a3b8', stroke: '#64748b' },
};

export function availabilityMarkerPathOptions(status: AvailabilityStatus): PathOptions {
  const { fill, stroke } = AVAILABILITY_MARKER_PALETTE[status];
  return {
    fillColor: fill,
    color: stroke,
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9,
  };
}

export function formatAvailabilityStatus(percentage: string): string {
  return percentage
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
