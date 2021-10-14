/*
  request data,
  convert to html
  populate main div
*/
export { enableSW, clientRequest, fetchPath };
import { renderToMarkup, request2cmd, cacheFetch } from './control';

let sw = false;

function enableSW() {
  sw = true;
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
