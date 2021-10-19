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

  const decoder = new TextDecoder('utf-8');
  const index = Deno.readFileSync('public/index.html');
  setIndexHtml(decoder.decode(index));

  doListener(config.port);
}

async function doListener(port: number) {
  const listener = Deno.listen({ port });
  mylog('listening', listener.addr);
  for await (const conn of listener) {
    doConn(conn);
  }
}

// @ts-ignore
async function doConn(conn: Deno.Conn) {
  const buf = new Uint8Array(4096);
  await conn.read(buf);
  const str = new TextDecoder().decode(buf);
  mylog('doConn', str.substring(0, 20));
  if(str.startsWith('GET ')) {
    const pos = str.indexOf(' ', 4);
    const path = str.substring(4, pos);
    await doGet(path, conn);
  }
  conn.close();
}

// @ts-ignore
async function doGet(path: string, conn: Deno.Conn) {
  if(path === '/') {
    const status = 301;
    const headers = [ ['Location', '/public/'] ];
    const res = new Response(null, { headers, status });
    await writeResponse(res, conn);
  }
  else if(path.startsWith('/public/')) {
    await doFile('.' + path, conn);
  }
  else if(path.startsWith('/myapi/')) {
    await doApi(path, conn);
  }
}

// @ts-ignore
async function doFile(path: string, conn: Deno.Conn) {
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
  const res = new Response(null, { headers, status, statusText });
  await writeResponse(res, conn);
  if(ok) {
    const file = await Deno.open(path);
    await Deno.copy(file, conn);
    file.close();
  }
}

// @ts-ignore
async function doApi(path: string, conn: Deno.Conn) {
  const res = await cacheFetch(path);
  await writeResponse(res, conn);
}

// @ts-ignore
async function writeResponse(res: Response, conn: Deno.Conn) {
  const encoder = new TextEncoder();
  conn.write(encoder.encode(`HTTP/1.0 ${res.status} ${res.statusText}\r\n`));
  res.headers.forEach((value, key, parent) => {
    const str = key + ': ' + value + '\r\n';
    conn.write(encoder.encode(str));
  });
  conn.write(encoder.encode('\r\n'));
  const body = new Uint8Array(await res.arrayBuffer());
  await conn.write(body);
}
