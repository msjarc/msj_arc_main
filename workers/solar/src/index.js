/**
 * msjarc-solar — a standalone worker that proxies N0NBH's solar feed.
 *
 * Why it exists: https://www.hamqsl.com/solarxml.php sends no `Access-Control-Allow-Origin`
 * header, so the homepage panel cannot fetch it from the browser. This serves the same XML
 * from msjarc.org itself and caches it at the edge, so every visitor gets current data
 * without hammering N0NBH's server.
 *
 * It stays a dumb proxy on purpose — the site parses the XML itself in src/utils/solar.ts,
 * so there is one parser and this worker never needs redeploying when the panel changes.
 *
 * Deploy:
 *   cd workers/solar
 *   npx wrangler deploy
 */

const UPSTREAM = 'https://www.hamqsl.com/solarxml.php'

/** N0NBH updates roughly hourly; 15 minutes keeps it fresh without pounding the feed. */
const EDGE_TTL_SECONDS = 900

/** How long a browser may reuse its own copy. */
const BROWSER_TTL_SECONDS = 300

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } })
    }

    const cache = caches.default
    const cacheKey = new Request(new URL(request.url).origin + '/api/solar', { method: 'GET' })

    const cached = await cache.match(cacheKey)
    if (cached) return cached

    const upstream = await fetch(UPSTREAM, {
      headers: { accept: 'text/xml', 'user-agent': 'msjarc.org band conditions panel' },
      cf: { cacheEverything: true, cacheTtl: EDGE_TTL_SECONDS },
    })

    if (!upstream.ok) {
      return new Response(`Upstream responded ${upstream.status}`, {
        status: 502,
        headers: { 'cache-control': 'no-store' },
      })
    }

    const response = new Response(await upstream.text(), {
      headers: {
        'content-type': 'text/xml; charset=utf-8',
        'cache-control': `public, max-age=${BROWSER_TTL_SECONDS}, s-maxage=${EDGE_TTL_SECONDS}`,
      },
    })

    ctx.waitUntil(cache.put(cacheKey, response.clone()))

    return response
  },
}
