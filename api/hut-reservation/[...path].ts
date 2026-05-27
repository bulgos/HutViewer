export const config = {
  runtime: 'edge',
};

const UPSTREAM = 'https://www.hut-reservation.org';
const DEFAULT_CACHE_SECONDS = 300;
const STALE_WHILE_REVALIDATE_SECONDS = 600;

function cacheSeconds(): number {
  const fromEnv = Number(process.env.AVAILABILITY_CACHE_SECONDS);
  return Number.isFinite(fromEnv) && fromEnv > 0
    ? Math.floor(fromEnv)
    : DEFAULT_CACHE_SECONDS;
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const prefix = '/api/hut-reservation';
  const pathAfterPrefix = url.pathname.startsWith(prefix)
    ? url.pathname.slice(prefix.length) || '/'
    : url.pathname;

  const upstreamUrl = `${UPSTREAM}${pathAfterPrefix}${url.search}`;

  const upstream = await fetch(upstreamUrl, {
    method: req.method,
    headers:
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : { 'Content-Type': req.headers.get('content-type') ?? 'application/json' },
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.text(),
  });

  const body = await upstream.text();
  const maxAge = cacheSeconds();

  return new Response(body, {
    status: upstream.status,
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/json',
      'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=${STALE_WHILE_REVALIDATE_SECONDS}`,
    },
  });
}
