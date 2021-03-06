/*
  Web, Service and Cloudflare workers that
  pre caches static files,
  deletes old caches,
  render json to html,
  passes through requests for other files.
*/

//// <reference lib="webworker"/>

export { worker, cfworker, sworker };
import type { Mapped, ExtendableEvent } from './control';
import { config, version, mylog, cacheFetch, setupIndexStrs } from './control';

const PRE_CACHE = [ 'index.html'
  ,'main.js'
  ,'static/app.css'
  ,'static/intro.html'
  ,'static/manifest.json'
  ,'static/favicon-32.png'
  ,'static/favicon-256.png'
];

/// @ts-ignore
declare var self: ServiceWorkerGlobalScope & Mapped;

interface FetchEvent extends ExtendableEvent {
  request: Request;
  respondWith(r: Promise<Response>): void;
};
interface ExtendableMessageEvent extends ExtendableEvent {
  readonly data: any;
}

function sworker() {
  mylog('sworker');
  self.addEventListener('install', onInstall);
  self.addEventListener('activate', onActivate);
  self.addEventListener('fetch', onFetch);
}

function cfworker() {
  mylog('cfworker');
  self.addEventListener('fetch', onFetch);
  cfUpdateConfig();
  setupIndexStrs(true);
}

function worker() {
  mylog('worker');
  self.addEventListener('message', onMessage);
  setupIndexStrs(false);
}

function onInstall(e: ExtendableEvent) {
  mylog('onInstall', e);
  mylog('precache', PRE_CACHE);
  e.waitUntil(caches.open(version).then(cache =>
    cache.addAll(PRE_CACHE)).then(() =>
      setupIndexStrs(false).then(() =>
        self.skipWaiting())));
}

function onActivate(e: ExtendableEvent) {
  mylog('onActivate', e);
  e.waitUntil(self.clients.claim().then(() =>
    caches.keys().then(keys =>
      Promise.all(keys.filter(key =>
        key !== version).map(name =>
          caches.delete(name))))));
}

function onFetch(e: FetchEvent) {
  e.respondWith(cacheFetch(e.request, e));
}

function onMessage(e: ExtendableMessageEvent) {
  cacheFetch(e.data)
  .then(res => res.text()
    .then(text => (<Worker><unknown>self).postMessage(text)));
}

function cfUpdateConfig() {
  Object.keys(config).forEach(key => {
    const value = self[key.toUpperCase()];
    if(value != null) (<Mapped>config)[key] = value;
  });
  config.worker = 'cf';
}
