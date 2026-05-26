# HutViewer

Map and list of Swiss Alpine Club huts with filters, area selection, and bed availability.

## Development

```bash
npm install
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000). Availability requests use a Vite dev proxy to avoid CORS (`/hut-reservation-api` → hut-reservation.org).

## GitHub Pages

The site deploys automatically on push to `main` or `master` via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

**One-time setup in the repository:**

1. **Settings → Pages → Build and deployment**
2. Set **Source** to **GitHub Actions**

After the workflow succeeds, the site is available at:

`https://<github-username>.github.io/<repository-name>/`

For example, if the repo is `JonasWard/HutViewer`, the URL is `https://jonasward.github.io/HutViewer/`.

You can also run the workflow manually from the **Actions** tab (**Deploy to GitHub Pages** → **Run workflow**).

### Production notes

- Asset paths use the repository name as the Vite `base` path (set automatically in CI via `GITHUB_REPOSITORY`).
- Availability calls the hut-reservation API directly in production builds. If the browser blocks those requests (CORS), availability filters and hut details will not load on GitHub Pages until a same-origin proxy is added.
