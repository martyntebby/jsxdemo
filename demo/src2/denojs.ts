/*
  Hacked up deno program avoiding std libs to fit in with modulehack.
  Unreliable, probably better way.
*/
//// <reference types="./denotypes"/>

export { denojs };
import { mylog, updateConfig, config } from '../src/misc';
import { setIndexHtml } from '../src/indexes';
import { cacheFetch } from '../src/control';

declare var Deno: any;

function denojs() {
  mylog('denojs');
  updateConfig(Deno.args);
  config.worker = 'deno';
  const index = Deno.readFileSync('public/index.html');
  setIndexHtml(new TextDecoder().decode(index));
  doListener(config.port);
}

async function doListener(port: number) {
  const listener = Deno.listen({ port });
  mylog('listening', listener.addr);
  for await (const conn of listener) {
    for await(const evt of Deno.serveHttp(conn)) {
      doRequest(evt);
    }
  }
}

// @ts-ignore
function doRequest(e: Deno.RequestEvent) {
  const url = new URL(e.request.url);
  const path = url.pathname + url.search;
  const resp = doGet(e.request.method === 'GET' ? path : 'not get');
  e.respondWith(resp);
}

function doGet(path: string) {
  mylog('doGet', path);
  if(path.startsWith('/myapi/')) return cacheFetch(path);
  if(path.startsWith('/public/')) return doFile('.' + path);
  const redirect = path === '/';
  const status = redirect ? 301 : 406;
  const statusText = redirect ? 'Moved Permanently' : 'Not Acceptable';
  const headers = [ ['Location', '/public/'] ];
  return new Response(null, { headers, status, statusText });
}

async function doFile(path: string) {
  let type = 'text/html';
  const pos = path.indexOf('?');
  if(pos > 0) path = path.substring(0, pos);
  if(path === './public/') path = './public/index.html';
  if(path.endsWith('.js')) type = 'application/javascript';
  if(path.endsWith('.json')) type = 'application/json';
  if(path.endsWith('.png')) type = 'image/png';
  const stat = await Deno.stat(path);
  const ok = stat.isFile;
  const status = ok ? 200 : 404;
  const statusText = ok ? 'OK' : 'File Not Found';
  const headers = [
    ['Date', new Date().toUTCString()],
    ['Content-Type', type],
    ['Content-Length', stat.size.toString()],
    ['Cache-Control', 'max-age=3600']
  ];
  const body = ok ? await Deno.readFile(path) : null;
  return new Response(body, { headers, status, statusText });
}
