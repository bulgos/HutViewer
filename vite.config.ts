import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const hutReservationProxy = {
  '/hut-reservation-api': {
    target: 'https://www.hut-reservation.org',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/hut-reservation-api/, '')
  }
} as const;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    hmr: true,
    proxy: hutReservationProxy
  },
  preview: {
    proxy: hutReservationProxy
  }
});
