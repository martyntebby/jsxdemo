/*
  Fetches data from hnapi or elsewhere and supplies as json or formatted html.
*/
export { enableCache, cacheFetch };
import { config, version, mylog, path2cmd } from './misc';
import { renderToMarkup } from './view';
import { STATIC_TTL, DYNAMIC_TTL, htmlResp } from './server';
import type { ExtendableEvent } from './types';

declare var caches: CacheStorage & { default?: Cache; };

let useCache = false;

function enableCache() {
  useCache = true;
}

async function cacheFetch(request: RequestInfo, evt?: ExtendableEvent) {
  const path = req2path(request);
  try {
    const cache = await getCache();
    const { cmd, arg, url } = path2cmd(path);
    const { cached, current } = await cacheMatch(cache, request, cmd);
    if(cached && current) return cached;
    const ttl = cmd ? DYNAMIC_TTL : STATIC_TTL;
    const resp2 = await fetchCF(url || request, ttl);
    if(!resp2.ok) return cached ?? resp2;
    const resp3 = await api2resp(resp2, cmd, arg);
    if(cache && cacheable(resp3, cmd, arg)) {
      const p = cache.put(request, resp3.clone());
      evt?.waitUntil(p);
    }
    return resp3;
  }
  catch(err) {
    mylog('Error', err);
    return new Response(err as any);
  }
}

function getCache() {
  const cache = useCache ? (caches.default || caches.open(version)) : undefined;
  return cache;
}

function req2path(request: RequestInfo) {
  if(typeof request === 'string') return request;
  const url = new URL(request.url);
  return url.pathname + url.search;
}

// look in cache for static or not too old
async function cacheMatch(cache: Cache | undefined, request: RequestInfo, cmd: string) {
  const cached = cache && await cache.match(request);
  const current = !!cached && (!cmd ||
    (Date.now() - (Date.parse(cached.headers.get('Date') ?? '')) < DYNAMIC_TTL * 1000));
  return { cached, current };
}

// fetch and cloudflare cache
function fetchCF(req: RequestInfo, ttl: number) {
  const init: RequestInit = { cf: { cacheTtl: ttl } } as any;
  return fetch(req, init);
}

async function api2resp(resp: Response, cmd: string, arg: string) {
  if(!cmd) return resp; // file
  const data = resp.json();
  const html = renderToMarkup(await data, cmd, arg);
  return htmlResp(html, DYNAMIC_TTL);
}

function cacheable(resp3: Response, cmd: string, arg: string) {
  return (resp3.ok &&
    (cmd === 'news' || cmd === 'newest' || arg === '1' ||
      (config.worker === 'cf'
        ? resp3.url === config.baseurl + '/index.html'
        : resp3.type === 'basic')
    )
  );
}
