"use strict";
const CACHE_NAME = '0.9.1';
const PRE_CACHE = ['./', 'manifest.json'];
const _self = self;
sw();
function sw() {
    console.log('sw', CACHE_NAME);
    _self.addEventListener('install', onInstall);
    _self.addEventListener('activate', onActivate);
    _self.addEventListener('fetch', onFetch);
}
function onInstall(e) {
    console.log('onInstall', e);
    console.log('precache', PRE_CACHE);
    e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
        .then(() => _self.skipWaiting()));
}
function onActivate(e) {
    console.log('onActivate', e);
    e.waitUntil(_self.clients.claim()
        .then(() => caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(name => caches.delete(name))))));
}
function onFetch(e) {
    e.respondWith(cacheFetch(e.request));
}
async function cacheFetch(request) {
    console.log('cacheFetch', request.url);
    if (request.mode === 'navigate')
        request = new Request('./');
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(request);
    if (!response) {
        response = await fetch(request);
        if (response && response.ok && response.type === 'basic') {
            console.log('cache', response);
            cache.put(request, response.clone());
        }
    }
    else {
        console.log('from cache', response.url);
    }
    return response;
}
