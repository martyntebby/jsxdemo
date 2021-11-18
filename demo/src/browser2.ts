/*
  request data,
  populate main div
*/
export { setWorker, fetchPaint };
import { renderToMarkup } from './view';
import { cacheFetch } from './control';
import { mylog, path2cmd } from './misc';
import type { FetchFunc } from './types';

let cmd = '';
let direct = false;
let worker: Worker | undefined;

function setWorker(work?: Worker) {
  mylog('setWorker', work);
  worker = work;
  direct = true;
  if(worker) {
    worker.onmessage = e => paint(e.data);
  }
}

async function fetchPaint(path?: string) {
  path = path || '/myapi/news/1';
  cmd = path2cmd(path).cmd;

  const main = document.getElementById('main')!;
  const child = main.firstElementChild;
  if(child) child.className = 'loading';

  if(worker) {
    worker.postMessage(path);
  }
  else {
    paint(await fetchPath(path));
  }
}

function paint(html: string) {
  const nav = document.getElementById('nav')!;
  const main = document.getElementById('main')!;
//  requestAnimationFrame(() => {
  main.innerHTML = html;
  nav.className = cmd || 'other';
  window.scroll(0, 0);
//  });
}

async function fetchPath(path: string) {
  const func: FetchFunc = direct ? fetch : cacheFetch;
  try {
    const resp = await func(path);
    return await resp.text();
  }
  catch(err) {
    mylog('Error', err);
    const details = err + ' Maybe offline?';
    return renderToMarkup(details, 'error', '');
  }
}
