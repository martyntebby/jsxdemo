"use strict";
const CACHE_NAME = '0.9.7';
const PRE_CACHE = ['index.html',
    'main.js',
    'static/app.css',
    'static/manifest.json',
    'static/favicon-32.png',
    'static/favicon-256.png'
];
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
    e.waitUntil(precache());
}
async function precache() {
    console.log('precache', PRE_CACHE);
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRE_CACHE);
    const resp = await cache.match('index.html');
    if (resp) {
        const { missing, resp2 } = await clearMain(resp);
        await cache.put('intro', new Response(missing));
        await cache.put('./', resp2);
    }
    _self.skipWaiting();
}
async function clearMain(resp) {
    const text = await resp.text();
    const main = '<main id="main">';
    const pos1 = text.indexOf(main) + main.length;
    const pos2 = text.indexOf('</main>', pos1);
    if (pos1 < main.length || pos2 < 0) {
        console.error('index.html is missing main section');
        return { missing: '', resp2: resp };
    }
    const body = text.substring(0, pos1) + text.substring(pos2);
    const missing = text.substring(pos1, pos2);
    const headers = [
        ['Content-Type', 'text/html; charset=UTF-8'],
    ];
    const resp2 = new Response(body, { headers: headers });
    return { missing, resp2 };
}
function onActivate(e) {
    console.log('onActivate', e);
    e.waitUntil(_self.clients.claim()
        .then(() => caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(name => caches.delete(name))))));
}
function onFetch(e) {
    e.respondWith(cacheFetch(e));
}
async function cacheFetch(e) {
    let request = e.request;
    if (request.mode === 'navigate')
        request = new Request('./');
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(request);
    if (!response) {
        response = await fetch(request);
        if (response && response.ok && response.type === 'basic') {
            e.waitUntil(cache.put(request, response.clone()));
        }
    }
    return response;
}
