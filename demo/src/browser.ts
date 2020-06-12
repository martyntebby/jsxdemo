/*
  Runs when page is loaded:
  updates config info from query params
  gets news data if main element is empty
  installs event listeners to fetch further data
  registers service worker
*/
export { browser };
import { mylog, config, updateConfig, renderToMarkup, request2cmd, cacheFetch } from './control';

let sw = false;
let myworker: Worker | undefined;

function browser() {
  mylog('browser');
  if(!('fetch' in window) || !('caches' in window)) {
    swfail('Browser not supported (missing caches / fetch).');
    return;
  }

  const query = window.location.search;
  if(query) updateConfig(query.substring(1).split('&'));

  const main = document.getElementById('main')!;
  if(!main.firstElementChild) clientRequest();

  window.onpopstate = onPopState;
  document.body.onclick = onClick;

  startWorker();
}

function startWorker() {
  if(config.worker === 'web' && window.Worker) {
    myworker = new Worker('main.js');
    myworker.onmessage = onMessage;
  }

  if(config.worker === 'service') {
    if('serviceWorker' in navigator) {
      navigator.serviceWorker.register('main.js')
        .then(reg => {sw=true; mylog(reg)}, reason => swfail(reason));
    }
    else {
      swfail('Not supported.');
    }
  }
}

function swfail(reason: string) {
  mylog('sw failed:', reason);
  const error = document.getElementById('error')!;
  error.outerHTML = renderToMarkup('', 'Warning', 'ServiceWorker failed: ' + reason +
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
    if(cmd != null) {
      e.preventDefault();
      const path = e.target.pathname;
      clientRequest(path, cmd);
      if(!cmd) window.history.pushState(path, '');
    }
  }
}

function onMessage(e: MessageEvent) {
  mylog('onMessage', e);
  gotResponse(e.data);
}

function clientRequest(path?: string, type?: string) {
  path = path || '/myapi/news/1';
  const { cmd } = request2cmd(path);

  const nav = document.getElementById('nav')!;
  const main = document.getElementById('main')!;
  const child = main.firstElementChild;
  if(child) child.className = 'loading';
  nav.className = cmd;

  fetchPath(path);
}

async function fetchPath(path: string) {
  if(myworker) {
    myworker.postMessage(path);
    return;
  }
  const func = sw ? fetch : cacheFetch;
  try {
    const resp = await func(path);
    const text = await resp.text();
    gotResponse(text);
  }
  catch(err) {
    const html = renderToMarkup('', '', err + '. Maybe offline?');
    gotResponse(html);
  }
}

function gotResponse(markup: string) {
  const main = document.getElementById('main')!;
  main.innerHTML = markup;
  window.scroll(0, 0);
}
