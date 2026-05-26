/** Vite dev/preview proxy path (same origin on localhost). */
export const AVAILABILITY_API_BASE = '/hut-reservation-api';

/** Bed availability API is only reachable via the local Vite proxy (CORS blocks static hosting). */
export function isAvailabilityApiEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1';
}
