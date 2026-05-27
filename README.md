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

Production uses [Vercel](https://vercel.com): availability calls hit an edge proxy ([`api/hut-reservation.ts`](api/hut-reservation.ts)) that forwards to hut-reservation.org and sets CDN cache headers (default **5 minutes**, configurable via `AVAILABILITY_CACHE_SECONDS` on Vercel).

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
5. **Redeploy manually**: `bunx vercel --prod` from the **repo root** (not `src/`), after `bunx vercel link`.

### Build failed: `vite build` exited with 127

Exit code **127** means the shell could not find `vite`. Vercel is running `vite build` directly instead of `bun run build`.

1. Run the CLI from the project root (where `package.json` and `vercel.json` live).
2. In Vercel → **Project → Settings → Build & Deployment**:
   - **Root Directory**: `.` (empty), not `src`
   - **Install Command**: `bun install` (or leave empty to use `vercel.json`)
   - **Build Command**: `bun run build` — **not** `vite build`
   - Turn off **Override** if it forces `vite build`
3. `vercel.json` sets `"framework": null` so the Vite preset does not replace the build command.

### Optional: deploy from CLI

```bash
cd /path/to/HutViewer   # repo root
bunx vercel --prod
```

Follow the prompts to link the project.
