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

/** Build upstream URL from Vercel rewrite (?path=…) or direct /api/hut-reservation/… invocation. */
function resolveUpstreamUrl(requestUrl: URL): string {
  const pathParam = requestUrl.searchParams.get('path');
  if (pathParam) {
    const params = new URLSearchParams(requestUrl.searchParams);
    params.delete('path');
    const qs = params.toString();
    const normalized = pathParam.replace(/^\//, '');
    return `${UPSTREAM}/${normalized}${qs ? `?${qs}` : ''}`;
  }

  const prefixes = ['/api/hut-reservation', '/hut-reservation-api'] as const;
  for (const prefix of prefixes) {
    if (requestUrl.pathname.startsWith(prefix)) {
      const rest = requestUrl.pathname.slice(prefix.length) || '/';
      return `${UPSTREAM}${rest}${requestUrl.search}`;
    }
  }

  return `${UPSTREAM}${requestUrl.pathname}${requestUrl.search}`;
}

export default async function handler(req: Request): Promise<Response> {
  const upstreamUrl = resolveUpstreamUrl(new URL(req.url));

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
