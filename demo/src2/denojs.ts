/*
  Hacked up deno program avoiding std libs to fit in with modulehack.
  Unreliable, probably better way.
*/
//// <reference types="./denotypes"/>

export { denojs };
import { mylog, updateConfig } from '../src/misc';
import { cacheFetch } from '../src/control';
import { modFilePath, fileResp, otherResp } from '../src/server';

declare var Deno: any;

function denojs() {
  mylog('denojs');
  const config = updateConfig(Deno.args, {worker: 'deno'});
  doServer(config.port);
}

async function doServer(port: number) {
  const listener = Deno.listen({ port });
  mylog('listening', listener.addr);
  for await(const conn of listener) {
    onConn(conn);
  }
}

// @ts-ignore
async function onConn(conn: Deno.Conn) {
  for await(const evt of Deno.serveHttp(conn)) {
    onRequest(evt);
  }
}

// @ts-ignore
function onRequest(e: Deno.RequestEvent) {
  try {
    const url = new URL(e.request.url);
    const path = url.pathname + url.search;
    const path2 = e.request.method === 'GET' ? path : 'not get';
    const resp = doGet(path2);
    e.respondWith(resp);
  }
  catch(err: any) {
    mylog(err);
    e.respondWith(new Response(null, { status: 500, statusText: err.toString() }));
  }
}

function doGet(path: string) {
  mylog('doGet', path);
  if(path.startsWith('/myapi/')) return cacheFetch(path);
  path = modFilePath(path);
  if(path.startsWith('/public/')) return doFile('.' + path);
  return new Response(null, otherResp(path));
}

async function doFile(path: string) {
  let body: Uint8Array | undefined = undefined;
  try {
    body = await Deno.readFile(path);
  }
  catch(err) { mylog(err) }
  const resp = fileResp(path, body);
  return new Response(body, resp);
}
