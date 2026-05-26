import type { HutAvailability } from '../hut-data/hut-availability';

/** Next upcoming day from the API list (or the first entry if all are in the past). */
export function pickAvailabilityDay(days: HutAvailability[]): HutAvailability | undefined {
  if (days.length === 0) return undefined;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = days
    .filter((d) => d.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return upcoming[0] ?? days[0];
}
