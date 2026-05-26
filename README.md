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

`vercel.json` pins install/build to Bun so Vercel does not fall back to npm when both `bun.lock` and `package-lock.json` exist.

### Troubleshooting: changes not showing on Vercel

1. **Use the Vercel URL** (`*.vercel.app` or your custom domain), not GitHub Pages (`bulgos.github.io/HutViewer/`). That is a separate, static deploy and will not pick up Vercel updates. Disable GitHub Pages under repo **Settings → Pages** if you no longer need it.
2. **Check the deployment** in the [Vercel dashboard](https://vercel.com/dashboard) → your project → **Deployments**. Production should list the same commit as `main` on GitHub. If the latest deploy failed or is old, open the logs or click **Redeploy**.
3. **Confirm Git integration**: project **Settings → Git** should point at `bulgos/HutViewer` with production branch `main`.
4. **Hard-refresh** the browser (cache can keep an old JS bundle): `Cmd+Shift+R` / `Ctrl+Shift+R`.
5. **Redeploy manually**: `bunx vercel --prod` from this directory (after `bunx vercel link`).

### Optional: deploy from CLI

```bash
bunx vercel
```

Follow the prompts to link the project.
