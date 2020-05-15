//// <reference lib="webworker" />
export { sw };
import { myapi, fetchMarkup } from '../src/control';

// @ts-ignore
declare var self: ServiceWorkerGlobalScope;

const CACHE_NAME = '0.9.2';
const PRE_CACHE = [ './'
  ,'main.js'
  ,'manifest.json'
  ,'assets/favicon-32.png'
  ,'assets/favicon-256.png'
];

function sw() {
  console.log('sw', CACHE_NAME);
  self.addEventListener('install', onInstall);
  self.addEventListener('activate', onActivate);
  self.addEventListener('fetch', onFetch);
}

// @ts-ignore
function onInstall(e: ExtendableEvent) {
  console.log('onInstall', e);
  console.log('precache', PRE_CACHE);
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
  .then(() => self.skipWaiting()));
}

// @ts-ignore
function onActivate(e: ExtendableEvent) {
  console.log('onActivate', e);
  e.waitUntil(self.clients.claim()
  .then(() => caches.keys().then(keys => Promise.all(keys.filter(key =>
  key !== CACHE_NAME).map(name => caches.delete(name))))));
}

// @ts-ignore
function onFetch(e: FetchEvent) {
  e.respondWith(cacheFetch(e.request));
}

async function cacheFetch(request: Request) {
  console.log('cacheFetch', request.url);
  const pos = request.url.indexOf(myapi);
  if(pos >= 0) {
    const { html } = await fetchMarkup(request.url.substring(pos + 1));
    return new Response(html);
  }
  if(request.mode === 'navigate') request = new Request('./');
  const cache = await caches.open(CACHE_NAME);
  let response = await cache.match(request);
  if(!response) {
    response = await fetch(request);
    if(response && response.ok && response.type === 'basic') {
      console.log('cache', response);
      cache.put(request, response.clone());
    }
  }
  else {
    console.log('from cache', response.url);
  }
  return response;
}
