/*
  Runs when page is loaded:
  updates config info from query params
  gets news data if main element is empty
  installs event listeners to fetch further data
  registers service worker
*/
export { browser };
import { fetchMarkup, mylog, updateConfig, config, renderToMarkup } from './control';

let useapi = false;

function browser() {
  mylog('browser');
  const query = window.location.search;
  if(query) updateConfig(query.substring(1).split('&'));
  const main = document.getElementById('main')!;
  if(!main.firstElementChild) clientRequest();

  window.onpopstate = onPopState;
  document.body.onclick = onClick;

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../public/sw.js')
    .then(reg => { mylog(reg); useapi = config.useapi; },
      reason => swfail(reason));
  }
  else {
    swfail('Not supported.');
  }
}

function swfail(reason: string) {
  mylog('sw failed:', reason);
  const error = document.getElementById('error')!;
  error.outerHTML = renderToMarkup('', '', 'ServiceWorker failed: ' + reason +
    '<br><br>Ensure cookies are enabled, the connection is secure,' +
    ' the browser is not in private mode and is supported' +
    ' (Chrome on Android, Safari on iOS).');
}

function onPopState(e: PopStateEvent) {
  clientRequest(e.state);
}

function onClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
    const direct = e.target.dataset.cmd === 'direct';
    clientRequest(e.target.pathname, direct);
    e.preventDefault();
    if(!direct) window.history.pushState(e.target.pathname, '');
  }
}

async function clientRequest(path?: string, direct?: boolean) {
  const datap = fetchMarkup(path, undefined, useapi, direct);
  const nav = document.getElementById('nav')!;
  const main = document.getElementById('main')!;
  const child = main.firstElementChild;
  if(child) child.className = 'loading';
  const { markup, cmd, arg } = await datap;
  main.innerHTML = markup;
  nav.className = cmd;
  window.scroll(0, 0);
}
