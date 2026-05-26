import type { HutAvailability } from '../hut-data/hut-availability';

export function todayIsoDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseFilterDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setHours(0, 0, 0, 0);
  return date;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Day matching the filter date, or the next upcoming day when no date is given. */
export function pickAvailabilityDay(
  days: HutAvailability[],
  filterDateIso?: string,
): HutAvailability | undefined {
  if (days.length === 0) return undefined;

  if (filterDateIso) {
    const target = parseFilterDate(filterDateIso);
    return days.find((d) => isSameCalendarDay(d.date, target));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = days
    .filter((d) => d.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return upcoming[0] ?? days[0];
}
