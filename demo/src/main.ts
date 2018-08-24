import { nodejs } from './nodejs';
import { link2cmd } from './link2cmd';
import { renderMarkup } from './view';

let prepath: string;

main();

function main() {
  console.log('main');
  typeof process === 'object' && process.version ? nodejs() : browser();
}

function browser() {
  console.log('browser');
  const path = document.location.pathname;
  let pos = path.search(/\/d(ist|emo)\//);
  pos = pos > -1 ? pos + 5 : path.lastIndexOf('/');
  prepath = path.substring(0, pos);
  console.log('prepath', prepath);

  if(!document.getElementsByTagName('main')[0].firstElementChild) {
    clientRequest(path);
  }

  window.onpopstate = onPopState;
  document.body.onclick = onClick;

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../dist/sw.js');
  }
}

function onPopState(e: Event) {
  clientRequest(document.location.pathname);
}

function onClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
    clientRequest(prepath + e.target.pathname, {});
    e.preventDefault();
  }
}

async function clientRequest(pathname: string, state?: any) {
  console.log('clientRequest', pathname);
  const { cmd, arg, url } = link2cmd(pathname, prepath.length);
  const datap = clientFetch(url);

  if (state) window.history.pushState(state, undefined, pathname);
  const elem = document.getElementsByTagName('main')[0];
  const child = elem.firstElementChild;
  if(child) child.className = 'loading';

  const html = renderMarkup(cmd, arg, await datap);
  elem.innerHTML = html;
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
