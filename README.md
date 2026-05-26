# HutViewer

Map and list of Swiss Alpine Club huts with filters, area selection, and bed availability.

## Development

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). Availability requests use a same-origin proxy path (`/hut-reservation-api` → hut-reservation.org) via the Vite dev server.

Preview the production build locally (proxy still active):

```bash
npm run build
npm run preview
```

## Deploy on Vercel

Production uses [Vercel](https://vercel.com) with a rewrite in [`vercel.json`](vercel.json) so availability API calls are proxied server-side (no CORS).

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Use the defaults (framework: Vite, build: `npm run build`, output: `dist`).
4. Deploy.

Each push to the connected branch gets a preview/production deployment. Bed availability works on the live URL the same way as locally.

### Optional: deploy from CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts to link the project.
