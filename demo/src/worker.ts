/*
  Service and Cloudflare workers that
  pre caches static files,
  deletes old caches,
  render json to html,
  passes through requests for other files.
*/

//// <reference lib="webworker"/>

export { worker, sworker, cfworker };
import { version, mylog, updateConfig } from './misc';
import { enableCache, cacheFetch } from './control';
import { STATIC_TTL, htmlResp } from './server';
import { indexes } from '../../dist/indexes';
import type { ExtendableEvent, FetchEvent } from './types';

const PRE_CACHE = [ 'index.html'
  ,'main.js'
  ,'static/app.css'
  ,'static/intro.html'
  ,'static/manifest.json'
  ,'static/favicon-32.png'
  ,'static/favicon-256.png'
];

/// @ts-ignore
declare var self: ServiceWorkerGlobalScope;

function worker() {
  mylog('worker');
  updateConfig([], {baseurl: '/public/', worker: 'web'});
  enableCache();
  self.addEventListener('message', onMessage);
}

function sworker() {
  mylog('sworker');
  updateConfig([], {baseurl: '/public/', worker: 'service'});
  enableCache();
  self.addEventListener('install', onInstall);
  self.addEventListener('activate', onActivate);
  self.addEventListener('fetch', onFetch);
}

function cfworker() {
  mylog('cfworker');
  const config = updateConfig(self, {worker: 'cf'});
  enableCache();
  self.addEventListener('fetch', onFetch);
}

function onInstall(e: ExtendableEvent) {
  mylog('onInstall', e);
  e.waitUntil(preCache());
}

function onActivate(e: ExtendableEvent) {
  mylog('onActivate', e);
  e.waitUntil(deleteOld());
}

function onFetch(e: FetchEvent) {
  e.respondWith(cacheFetch(e.request, e));
}

async function onMessage(e: MessageEvent) {
  const resp = await cacheFetch(e.data);
  const html = await resp.text();
  postMessage(html);
}

async function preCache() {
  mylog('preCache', PRE_CACHE);
  const cache = await caches.open(version);
  await cache.addAll(PRE_CACHE);
  const resp = await cache.match('index.html');
  const index = await resp!.text();
  const html = indexes.join('');
  await cache.put('./', htmlResp(html, STATIC_TTL));
  await self.skipWaiting();
}

async function deleteOld() {
  mylog('deleteOld', version);
  await self.clients.claim();
  const keys = await caches.keys();
  const keys2 = keys.filter(key => key !== version);
  await Promise.all(keys2.map(name => caches.delete(name)));
}
