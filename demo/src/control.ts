/*
  Fetches data from hnapi or elsewhere and supplies as json or formatted html.
  Re exports some view methods and handles config info from package.json.
*/
export { enableCache, setupIndex, cacheRoot, cacheFetch, path2cmd };
import { getIndexHtml, setIndexHtml } from './indexes';
import { config, version, mylog } from './misc';
import type { ExtendableEvent } from './misc';
import { renderToMarkup } from './view';

const STATIC_TTL = 60 * 60 * 24;
const DYNAMIC_TTL = 60 * 10;

declare var caches: CacheStorage & { default?: Cache; };

let useCache = false;

function enableCache() {
  useCache = true;
}

async function getCache(): Promise<Cache | undefined | false> {
  return useCache && (caches.default || await caches.open(version));
}

async function setupIndex() {
  mylog('setupIndex');
  const url = config.baseurl + '/index.html';
  const resp = await cacheFetch(url);
  if(resp.ok) {
    const index = await resp.text();
    setIndexHtml(index);
  }
  return resp.ok;
}

async function cacheRoot() {
  if(await setupIndex()) {
    mylog('cacheRoot');
    const html = getIndexHtml();
    setIndexHtml('');
    const cache = await getCache();
    if(cache) cache.put('./', html2response(html, STATIC_TTL));
  }
}

async function cacheFetch(request: RequestInfo, evt?: ExtendableEvent) {
  try {
    return await cacheFetch1(request, evt);
  }
  catch(err) {
    mylog('Error', err);
    return new Response(err as any);
  }
}

async function cacheFetch1(request: RequestInfo, evt?: ExtendableEvent) {
  const { cmd, arg, url } = path2cmd(request);

  // look in cache for static or not too old
  const cache = await getCache();
  const cached = cache && await cache.match(request);
  if(cached) {
    if(!cmd) return cached; // static
    const date = cached.headers.get('Date');
    if(date) {
      const diff = Date.now() - Date.parse(date);
      if(diff < DYNAMIC_TTL * 1000) return cached;
    }
  }

  // fetch - if error return old version
  const ttl = cmd ? DYNAMIC_TTL : STATIC_TTL;
  const init: RequestInit = { cf: { cacheTtl: ttl } } as any;
  const resp2 = await fetch(url || request, init);
  if(!resp2.ok) return cached || resp2;

  // convert and maybe cache
  const resp3 = cmd ? await api2response(resp2, cmd, arg) : resp2;
  if(cache && resp3.ok &&
      (cmd === 'news' || cmd === 'newest' || arg === '1' ||
      (config.worker !== 'cf' ? resp3.type === 'basic'
        : resp3.url === config.baseurl + '/index.html'))) {
    const p = cache.put(request, resp3.clone());
    evt?.waitUntil(p);
  }
  return resp3;
}

async function api2response(resp: Response, cmd: string, arg: string) {
  const data = await resp.json();
  const html = renderToMarkup(data, cmd, arg);
  return html2response(html, DYNAMIC_TTL);
}

function html2response(html: string, ttl: number) {
  const headers = [
    //['Link', '</public/main.js>; rel=preload; as=script'],
    ['Date', new Date().toUTCString()],
    ['Content-Type', 'text/html'],
    ['Content-Length', html.length.toString()],
    ['Cache-Control', 'max-age=' + ttl]
  ];
  return new Response(html, { headers: headers, status: 200, statusText: 'OK' });
}

function path2cmd(request: RequestInfo, log?: boolean) {
  let path: string;
  if(typeof request === 'string') {
    path = request;
  }
  else {
    const url = new URL(request.url);
    path = url.pathname + url.search;
  }
  const re = /\/|\?|&/;
  const strs = path.split(re);
  const api = path === '/' || strs[1] === 'myapi';
  const cmd = !api ? '' : strs[2] || 'news';
  const arg = !api ? '' : strs[3] || '1';
  const url = !api ? '' : cmd2url(cmd, arg);
  const ret = { cmd, arg, url };
  if(log) mylog('path2cmd', path, ret);
  return ret;
}

function cmd2url(cmd: string, arg: string) {
  switch(cmd) {
//    case 'search': return `https://hn.algolia.com/api/v1/search?${arg}&hitsPerPage=50&tags=story`;
    case 'search': return `https://hn.algolia.com/api/v1/search?${arg}&tags=story`;
    case 'newest': return `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`;
    default: return `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
  }
}
