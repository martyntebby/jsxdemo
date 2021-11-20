/*
  node and deno helpers.
*/
export { ext2type, modFilePath, newHeaders, fileResp, otherResp, htmlResp };

export const STATIC_TTL = 60 * 60 * 24;
export const DYNAMIC_TTL = 60 * 10;

function ext2type(path: string) {
  if(path.endsWith('.js')) return 'application/javascript';
  if(path.endsWith('.json')) return 'application/json';
  if(path.endsWith('.png')) return 'image/png';
  return 'text/html';
}

function modFilePath(path: string) {
  const pos = path.indexOf('?');
  if(pos > 0) path = path.substring(0, pos);
  if(path === '/public/') path = '/public/index.html';
  if(path === '/favicon.ico') path = '/public/static/favicon-32.png'; // ???
  return path;
}

function newHeaders(ttl: number, type: string, len = 0) {
  return {
    'Date': new Date().toUTCString(),
    'Cache-Control': 'max-age=' + ttl,
    'Content-Type': type,
    'Content-Length': '' + len,
  };
}

function otherResp(path: string) {
  const redirect = path === '/';
  return {
    status: redirect ? 301 : 406,
    statusText: redirect ? 'Moved Permanently' : 'Not Acceptable',
    headers: redirect ? { 'Location': '/public/' } : undefined,
    body: undefined
  }
}

function fileResp(path: string, data?: Uint8Array) {
  const ok = !!data;
  return {
    status: ok ? 200 : 404,
    statusText: ok ? 'OK' : 'File Not Found',
    headers: ok ? newHeaders(3600, ext2type(path), data?.length) : undefined,
    body: data,
  }
}

function htmlResp(html: string, ttl: number) {
  const headers = newHeaders(ttl, 'text/html', html.length);
  return new Response(html, { headers: headers, status: 200, statusText: 'OK' });
}
