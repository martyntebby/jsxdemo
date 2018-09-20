import { nodejs } from './nodejs';
import { State, link2cmd } from './control';
import { renderToMarkup } from './view';

let prepath: string;

main();

function main() {
  console.log('main');
  typeof process === 'object' && process.version ? nodejs() : browser();
}

function browser() {
  console.log('browser');
  const path = document.location.pathname;
  let pos = path.search(/\/(dist|demo)\//);
  pos = pos > -1 ? pos + 5 : path.lastIndexOf('/');
  prepath = path.substring(0, pos);
  console.log('prepath', prepath);

  const main = document.getElementById('main')!;
  if(!('fetch' in window)) {
    main.innerHTML = renderToMarkup('', '', 'Requires modern browser.');
    return;
  }

  if(!main.firstElementChild) {
    clientRequest(path);
  }

  window.onpopstate = onPopState;
  document.body.onclick = onClick;

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../dist/sw.js');
  }
}

function onPopState(e: PopStateEvent) {
  clientRequest(document.location.pathname, e.state);
}

function onClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
    clientRequest(prepath + e.target.pathname, null, true);
    e.preventDefault();
  }
}

async function clientRequest(path: string, state?: State|null, push?: boolean) {
  console.log('clientRequest', path, state);
  const { cmd, arg, url } = link2cmd(path, prepath.length, state);
  const datap = clientFetch(url);

  if (push) window.history.pushState({ cmd, arg }, undefined);

  const nav = document.getElementById('nav')!;
  nav.className = cmd;
  const main = document.getElementById('main')!;
  const child = main.firstElementChild;
  if(child) child.className = 'loading';

  const html = renderToMarkup(cmd, arg, await datap);
  main.innerHTML = html;
}

async function clientFetch(url: string) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return resp.statusText;
    const json = await resp.json();
    return !json ? 'No data' : json.error ? json.error.toString() : json;
  }
  catch (err) {
    return err.toString();
  }
}
