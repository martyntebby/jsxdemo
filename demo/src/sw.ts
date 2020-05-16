//// <reference lib="webworker" />
export { sw };
import { version, myapi, fetchMarkup } from '../src/control';

/// @ts-ignore
declare var self: ServiceWorkerGlobalScope;

const CACHE_NAME = version;
const PRE_CACHE = [ 'index.html'
  ,'main.js'
  ,'manifest.json'
  ,'assets/favicon-32.png'
  ,'assets/favicon-256.png'
];

// hack events to get to compile
interface ExtendableEvent {
  waitUntil(f: any): void
}

interface FetchEvent extends ExtendableEvent {
  respondWith(r: Response | Promise<Response>): void
  readonly request: Request
}

function sw() {
  console.log('sw', CACHE_NAME);
  self.addEventListener('install', onInstall);
  self.addEventListener('activate', onActivate);
  self.addEventListener('fetch', onFetch);
}

function onInstall(e: ExtendableEvent) {
  console.log('onInstall', e);
  e.waitUntil(precache());
}

async function precache() {
  console.log('precache', PRE_CACHE);
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(PRE_CACHE);
  const resp = await cache.match('index.html');
  if(resp) await cache.put('./', resp);
  self.skipWaiting();
}

function onActivate(e: ExtendableEvent) {
  console.log('onActivate', e);
  e.waitUntil(self.clients.claim()
  .then(() => caches.keys().then(keys => Promise.all(keys.filter(key =>
  key !== CACHE_NAME).map(name => caches.delete(name))))));
}

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
