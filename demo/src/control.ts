/*
  Fetches data from hnapi or elsewhere and supplies as json or formatted html.
  Re exports some view methods and handles config info from package.json.
*/
export { request2cmd, splitIndexMain };
export { cacheFetch, setupIndexStrs };
export { updateConfig, perftest };
export type { Mapped, ExtendableEvent };
export { mylog, renderToMarkup } from './view';
import { mylog, renderToMarkup } from './view';
export { config, version } from '../../package.json';
import { config, version } from '../../package.json';

const STATIC_TTL = 60 * 60 * 24 * 30;
const DYNAMIC_TTL = 60 * 10;

type Mapped = { [key: string]: unknown; };

interface ExtendableEvent {
  waitUntil(f: any): void;
};

let indexStrs: string[] | undefined;

declare var caches: CacheStorage & { default?: Cache; } | undefined;

async function getCache() {
  // TODO: handle deno no caches
  return caches && (caches.default || await caches.open(version));
}

async function cacheFetch(request: RequestInfo, evt?: ExtendableEvent) {
  const reqstr = (<Request>request).url || request;
  mylog('cacheFetch', reqstr);
  const { cmd, arg, req } = request2cmd(request);
  const cache = await getCache();
  // look in cache
  const cached = cache && await cache.match(request)
  // if fixed or not too old return
  if(cached) {
    mylog('cached', reqstr);
    if(!cmd) return cached;
    const date = cached.headers.get('Date');
    if(date) {
      const diff = Date.now() - Date.parse(date);
      if(diff < DYNAMIC_TTL * 1000) return cached;
    }
    mylog('too old', reqstr, date);
  }
  // fetch if not found
  const ttl = cmd ? DYNAMIC_TTL : STATIC_TTL;
  const init: RequestInit = { cf: { cacheTtl: ttl } } as any;
  const resp2 = await fetch(req, init);
  // if fails return old cache or failure
  if(!resp2.ok) {
    mylog('fetching', resp2.url, 'failed', resp2.status, resp2.statusText);
    return cached || resp2;
  }
  // if render do
  const resp3 = cmd ? await api2response(resp2, cmd, arg) : resp2;
  if(cache && resp3.ok) { //} && resp3.type === 'basic') {
    // TODO: only cache subset - not user, item, ...
    mylog('caching', reqstr);
    const p = cache.put(request, resp3.clone());
    evt?.waitUntil(p);
  }
  return resp3;
}

async function api2response(resp: Response, cmd: string, arg: string) {
  const cf = config.worker === 'cf';
  const data = await resp.json();
  const markup = renderToMarkup(cmd, arg, data);
  const sections = cf ? await setupIndexStrs(cf) : [];
  if(!sections) {
    mylog('missing sections');
    return Response.error();
  }
  const html = cf ? sections[0] + markup + sections[2] : markup;
  return html2response(html, DYNAMIC_TTL);
}

async function setupIndexStrs(cf = false) {
  if(indexStrs === undefined) {
    const url = (cf ? 'https://jsxrender.westinca.com' : '') + '/public/index.html';
    const resp = await cacheFetch(url);
    if(resp.ok) {
      const index = await resp.text();
      indexStrs = splitIndexMain(index);
      const cache = await getCache();
      cache?.put('./', html2response(indexStrs[0] + indexStrs[2], STATIC_TTL));
    }
  }
  return indexStrs;
}

function splitIndexMain(text: string): string[] {
  const main = '<main id="main">';
  const pos1 = text.indexOf(main) + main.length;
  const pos2 = text.indexOf('</main>', pos1);
  return [ text.substring(0, pos1), text.substring(pos1, pos2), text.substring(pos2) ];
}

function html2response(html: string, ttl: number) {
  const headers = [
    //['Link', '</public/main.js>; rel=preload; as=script'], //, </public/app.css>; rel=preload; as=style'],
    ['Date', new Date().toUTCString()],
    ['Content-Type', 'text/html'],
    ['Content-Length', html.length.toString()],
    ['Cache-Control', 'max-age=' + ttl]
  ];
  return new Response(html, { headers: headers, status: 200, statusText: 'OK' });
}

function request2cmd(request: RequestInfo) {
  const path = typeof request === 'string' ? request
    : new URL(request.url).pathname;
  const strs = path.split('/');
  const api = strs[1] === 'myapi';
  const cmd = !api ? '' : strs[2] || 'news';
  const arg = !api ? '' : strs[3] || '1';
  const req = api ? cmd2url(cmd, arg) : request;
  return { cmd, arg, req };
}

function cmd2url(cmd: string, arg: string, useapi?: boolean) {
  return useapi ? `/myapi/${cmd}/${arg}`
  : cmd === 'newest'
  ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
  : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
}


function updateConfig(args: string[]): void {
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if(key in config) (<Mapped>config)[key] = value ?? true;
  });
}

function perftest(items: any): void {
  const iterations = config.perftest > 1 ? config.perftest : 10000;
  console.log('perftest', iterations);
  const start = Date.now();
  let count = 0;
  for(let i = iterations; i > 0; --i) {
    const str = renderToMarkup('news', '1', items);
    if(str !== i.toString()) count++;
  }
  const end = Date.now();
  const duration = (end - start) / 1000.0;
  const tps = (iterations / duration).toFixed();
  const str = 'iterations ' + count + '  duration ' + duration + '  tps ' + tps;
  console.log(str);
}
