import { doRender } from './view';

let prepath: string;

main();

function main() {
  console.log('main');
  const pathname = document.location.pathname;
  prepath = pathname.substring(0, pathname.lastIndexOf('/'));
  fetchRender(pathname);

  window.onpopstate = onPopState;
  document.body.onclick = onClick;

  if('serviceWorker' in navigator) {
    navigator.serviceWorker.register('../dist/sw.js');
  }
}

function onPopState(e: Event) {
  fetchRender(document.location.pathname);
}

function onClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
    fetchRender(prepath + e.target.pathname, {});
    e.preventDefault();
  }
}

async function fetchRender(pathname: string, state?: any) {
  console.log('fetchRender', pathname);
  const { cmd, arg, url } = link2cmd(pathname);
  const datap = doFetch(url);
  if (state) window.history.pushState(state, '', pathname);
  const elem = document.getElementsByTagName('main')[0];
  elem.firstElementChild!.className = 'loading';
//  const doRender = (await import('./view.js')).doRender;
  doRender(cmd, arg, await datap, elem);
}

function link2cmd(pathname: string) {
  const strs = pathname.substring(prepath.length).split('/');
  if(strs[1] === 'index.html') strs[1] = '';
  const cmd = strs[1] || 'news';
  const arg = strs[2] || '1';
  const url = cmd === 'newest'
  ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
  : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
  return { cmd, arg, url };
}

async function doFetch(url: string) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return resp.statusText;
    const json = await resp.json();
    return json.error ? json.error.toString() : json;
  }
  catch (err) {
    return err.toString();
  }
}
