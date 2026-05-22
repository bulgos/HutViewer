export type HutAvailability = {
  date: Date;
  dateFormatted: string;
  freeBeds: number;
  totalSleepingPlaces: number;
};

export function availabilityLevel(freeBeds: number, totalSleepingPlaces: number): number {
  if (totalSleepingPlaces === 0) return 0;
  return 100 * (1 - freeBeds / totalSleepingPlaces);
}

export const getAvailabilityStatus = (percentage: number): string => {
  if (percentage >= 99) return 'full';
  if (percentage >= 70) return 'nearly-full';
  if (percentage >= 40) return 'half-full';
  if (percentage >= 1) return 'low';
  return 'empty';
};

export function formatAvailabilityStatus(percentage: string): string {
  return percentage
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
