//// <reference lib="webworker" />
export { cfworker };
import { fetchData, fetchMarkup } from '../src/control';

const ttl = 1800;

function cfworker() {
  console.log('cfworker');
/// @ts-ignore
(<ServiceWorkerGlobalScope><unknown>self).addEventListener('fetch', e => e.respondWith(handleRequest(e)));
}

/// @ts-ignore
async function handleRequest(e: FetchEvent) {
  const request = e.request;
  const cache: Cache = (<any>caches).default;
  let response = await cache.match(request);
  if(response) return response;

  const init: any = { cf: { cacheTtl: ttl } };
  const indexp = fetchData('https://jsxrender.westinca.com/public/index.html', init);
  const { html } = await fetchMarkup('/news/1', init);
  const index: string = await indexp;
  const pos = index.indexOf('</main>');
  if(pos < 0) return new Response(index);

  const headers = [
    ['Content-Type', 'text/html'],
    ['Cache-Control', 'max-age=' + ttl]
  ];
  const str = index.substring(0, pos) + html + index.substring(pos);
  response = new Response(str, { headers: headers });
  e.waitUntil(cache.put(request, response.clone()));
  return response;
}
