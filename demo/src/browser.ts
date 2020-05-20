/*
  Runs when page is loaded:
  updates config info from query params
  gets news data if main element is empty
  installs event listeners to fetch further data
  registers service worker
*/
export { browser };
import { fetchMarkup, mylog, updateConfig, config } from './control';

let useapi = false;

function browser() {
  mylog('browser');
  const query = window.location.search;
  if(query) updateConfig(query.substring(1).split('&'));
  const main = document.getElementById('main')!;
  if(!main.firstElementChild) clientRequest();
  window.onpopstate = onPopState;
  document.body.onclick = onClick;
  navigator.serviceWorker.register('../public/sw.js')
    .then(reg => { mylog(reg); useapi = config.useapi; });
}

function onPopState(e: PopStateEvent) {
  clientRequest(e.state);
}

function onClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
    clientRequest(e.target.pathname);
    e.preventDefault();
    window.history.pushState(e.target.pathname, '');
  }
}

async function clientRequest(path?: string) {
  const datap = fetchMarkup(path, undefined, useapi);
  const nav = document.getElementById('nav')!;
  const main = document.getElementById('main')!;
  const child = main.firstElementChild;
  if(child) child.className = 'loading';
  const { markup, cmd, arg } = await datap;
  main.innerHTML = markup;
  nav.className = cmd;
  window.scroll(0, 0);
}
