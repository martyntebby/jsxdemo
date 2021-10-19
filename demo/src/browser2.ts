/*
  request data,
  populate main div
*/
export { setDirect, clientRequest };
import { renderToMarkup } from './view';
import { request2cmd, cacheFetch } from './control';
import { mylog } from './misc';

let direct = false;

function setDirect() {
  direct = true;
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
  const func = direct ? fetch : cacheFetch;
  try {
    const resp = await func(path);
    return await resp.text();
  }
  catch(err) {
    mylog('Error', err);
    return renderToMarkup('', '', err + ' Maybe offline?');
  }
}
