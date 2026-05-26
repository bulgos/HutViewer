# HutViewer

Map and list of Swiss Alpine Club huts with filters, area selection, and bed availability.

## Development

```bash
bun install
bun run dev
```

Opens at [http://localhost:3000](http://localhost:3000). Availability requests use a same-origin proxy path (`/hut-reservation-api` → hut-reservation.org) via the Vite dev server.

Preview the production build locally (proxy still active):

```bash
bun run build
bun run preview
```

## Deploy on Vercel

Production uses [Vercel](https://vercel.com) with a rewrite in [`vercel.json`](vercel.json) so availability API calls are proxied server-side (no CORS).

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Vercel should detect Bun from `bun.lock` (install: `bun install`, build: `bun run build`, output: `dist`). If not, set those manually.
4. Deploy.

Each push to the connected branch gets a preview/production deployment. Bed availability works on the live URL the same way as locally.

### Optional: deploy from CLI

```bash
bunx vercel
```

Follow the prompts to link the project.
