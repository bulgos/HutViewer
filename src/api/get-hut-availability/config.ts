/**
 * Same-origin path proxied to hut-reservation.org:
 * - local: Vite dev server (vite.config.ts)
 * - production: Vercel edge function with CDN cache (api/hut-reservation, vercel.json)
 */
export const AVAILABILITY_API_BASE = '/hut-reservation-api';
