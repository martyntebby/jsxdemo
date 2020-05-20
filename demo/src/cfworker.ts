/*
  Cloudflare worker.
  Intercepts call to base url. Returns cached response
  or fills in index.html with current news data and caches.
  Can initiate http/2 server push using link header.
*/
//// <reference lib="webworker" />
export { cfworker };
import { fetchData, fetchMarkup, mylog, config } from '../src/control';

/// @ts-ignore
declare var self: ServiceWorkerGlobalScope;

function cfworker() {
  mylog('cfworker');
  updateConfig();
  /// @ts-ignore
  self.addEventListener('fetch', e => e.respondWith(handleRequest(e)));
}

function updateConfig() {
  Object.keys(config).forEach(key => {
    const value = (<any>self)[key.toUpperCase()];
    if(value != null) (<any>config)[key] = value || true;
  });
}

/// @ts-ignore
async function handleRequest(e: FetchEvent) {
  // get and cache data for base url access
  const request = e.request;
  const cache: Cache = (<any>caches).default;
  let response = await cache.match(request);
  if(response) return response;

  // get index.html and news and combine them
  const init: any = { cf: { cacheTtl: config.cfttl } };
  const indexp = fetchData('https://jsxrender.westinca.com/public/index.html', init);
  const { markup } = await fetchMarkup('/news/1', init);
  const index: string = await indexp;
  const pos = index.indexOf('</main>');
  if(pos < 0) return new Response(index); // error

  const headers = [
  //['Link', '</public/main.js>; rel=preload; as=script'], //, </public/app.css>; rel=preload; as=style'],
    ['Content-Type', 'text/html'],
    ['Cache-Control', 'max-age=' + config.cfttl]
  ];
  const str = index.substring(0, pos) + markup + index.substring(pos);
  response = new Response(str, { headers: headers });
  e.waitUntil(cache.put(request, response.clone()));
  return response;
}
