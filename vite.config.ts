import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub Pages project site: https://<user>.github.io/<repo>/ */
function githubPagesBase(): string | undefined {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  return repo ? `/${repo}/` : undefined
}

const hutReservationProxy = {
  '/hut-reservation-api': {
    target: 'https://www.hut-reservation.org',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/hut-reservation-api/, '')
  }
} as const;

// https://vite.dev/config/
export default defineConfig({
  base: githubPagesBase() ?? '/',
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
