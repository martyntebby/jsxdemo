import { nodejs } from './nodejs';
import { fetchMarkup } from './control';

let useapi = false;

main();

function main() {
  console.log('main');
  typeof process === 'object' && process.version ? nodejs() : browser();
}

function browser() {
  console.log('browser');
  const main = document.getElementById('main')!;
  if(!main.firstElementChild) clientRequest();
  window.onpopstate = onPopState;
  document.body.onclick = onClick;
  navigator.serviceWorker.register('sw.js')
    .then(reg => { console.log(reg); useapi = true; });
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
  const datap = fetchMarkup(path, useapi);
  const nav = document.getElementById('nav')!;
  const main = document.getElementById('main')!;
  const child = main.firstElementChild;
  if(child) child.className = 'loading';
  const { html, cmd, arg } = await datap;
  main.innerHTML = html;
  nav.className = cmd;
  window.scroll(0, 0);
}
