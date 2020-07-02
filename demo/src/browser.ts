/*
  Runs when page is loaded:
  updates config info from query params
  gets news data if main element is empty
  installs event listeners to fetch further data
  registers service worker
*/
export { browser };
import { mylog, config, updateConfig, renderToMarkup, request2cmd, cacheFetch, perftest } from './control';

let sw = false;
let started = 0;

async function browser() {
  mylog('browser');
  if(!('fetch' in window)) {
    swfail('Browser not supported.', 'Missing fetch.');
    return;
  }

  const query = window.location.search;
  if(query) updateConfig(query.substring(1).split('&'));

  const main = document.getElementById('main')!;
  if(!main.firstElementChild) clientRequest();

  window.onmessage = onMessage;
  window.onpopstate = onPopState;
  document.body.onclick = onClick;

  startWorker();
}

function startWorker() {
  if(config.worker === 'service' && !config.perftest) {
    if('serviceWorker' in navigator) {
      // using main.js does not get swapped out - probably because of self caching
      navigator.serviceWorker.register('sw.js')
        .then(reg => {sw=true; mylog(reg)}, err => swfail('ServiceWorker failed.', err));
    }
    else {
      swfail('ServiceWorker unsupported.', '');
    }
  }
}

function swfail(summary: string, reason: string) {
  mylog('sw failed:', summary, reason);
  const error = document.getElementById('error')!;
  error.outerHTML = renderToMarkup('', summary, reason +
    '<br><br>Ensure cookies are enabled, the connection is secure,' +
    ' the browser is not in private mode and is supported' +
    ' (Chrome on Android, Safari on iOS).');
}

function onPopState(e: PopStateEvent) {
  clientRequest(e.state);
}

function onClick(e: Event) {
  if(e.target instanceof HTMLAnchorElement) {
    const cmd = e.target.dataset.cmd;
    if(cmd !== undefined) {
      e.preventDefault();
      if(cmd === 'perftest') return perftest1();
      started = 0;
      const path = cmd || e.target.pathname;
      window.history.pushState(path, '');
      clientRequest(path);
    }
  }
}

async function onMessage(e: MessageEvent) {
//  mylog('onMessage', e.data);
  if(!started) return;
  const count: number = e.data;
  if(count > 0) {
    const markupp = fetchPath('/myapi/ask/2');
    const main = document.getElementById('main')!;
    const markup = await markupp;
    window.postMessage(count - 1, '*');
    main.innerHTML = markup;
  }
  else {
    const duration = (Date.now() - started) / 1000;
    const iterations = -config.perftest;
    const ips = (iterations / duration).toFixed();
    const str = 'iterations: ' + iterations + ' duration: ' + duration + ' fps: ' + ips;
    mylog(str);
    const main = document.getElementById('main')!;
    main.innerHTML = str;
    started = 0;
  }
}

async function clientRequest(path?: string) {
  path = path || '/myapi/news/1';
  const markupp = fetchPath(path);
  const { cmd } = request2cmd(path);

  const nav = document.getElementById('nav')!;
  const main = document.getElementById('main')!;
  const child = main.firstElementChild;
  if(child) child.className = 'loading';

  main.innerHTML = await markupp;
  nav.className = cmd || 'other';
  window.scroll(0, 0);
}

async function fetchPath(path: string) {
  const func = sw ? fetch : cacheFetch;
  try {
    const resp = await func(path);
    return await resp.text();
  }
  catch(err) {
    return renderToMarkup('', '', err + ' Maybe offline?');
  }
}

function perftest1() {
  if(config.perftest > 0) {
    perftest2();
  }
  else {
    if(started) {
      mylog('stop');
      started = 0;
    }
    else {
      mylog('perftest1', config.perftest);
      started = Date.now();
      window.postMessage(-config.perftest, '*');
    }
  }
}

async function perftest2() {
  const main = document.getElementById('main')!;
  const func = config.perftest > 0 ? undefined :
    (str: string) => main.innerHTML = str;
  main.innerHTML = 'perftest ' + config.perftest + ' ...';
  main.innerHTML = await perftest(undefined, func);
}
