/*
  Fetches data from hnapi or elsewhere and supplies as json or formatted html.
  Re exports some view methods and handles config info from package.json.
*/
export { cacheFetch, request2cmd, setupIndexStrs, splitIndexMain };
export { updateConfig, perftest };
export type { Mapped, ExtendableEvent };
export { mylog, renderToMarkup } from './view';
import { mylog, renderToMarkup } from './view';
export { config, version } from '../../package.json';
import { config, version } from '../../package.json';

const STATIC_TTL = 60 * 60 * 24;
const DYNAMIC_TTL = 60 * 10;
const BASE_URL = 'https://jsxrender.westinca.com/public';
const MAIN_SITE_INDEX = BASE_URL + '/index.html';

type Mapped = { [key: string]: unknown; };

interface ExtendableEvent {
  waitUntil(f: any): void;
};

let isServer: boolean | undefined;
let indexStrs: string[] | undefined;

declare var caches: CacheStorage & { default?: Cache; };

async function getCache(): Promise<Cache | undefined> {
  return caches.default || await caches.open(version);
}

async function cacheFetch(request: RequestInfo, evt?: ExtendableEvent) {
  try {
    return await cacheFetch1(request, evt);
  }
  catch(err) {
    return new Response(err);
  }
}

async function cacheFetch1(request: RequestInfo, evt?: ExtendableEvent) {
  const reqstr = typeof request === 'string' ? request : request.url;
  mylog('cacheFetch', reqstr);
  const { cmd, arg, req } = request2cmd(request);

  // look in cache for static or not too old
  const cache = await getCache();
  const cached = cache && await cache.match(request);
  if(cached) {
    if(!cmd) return cached; // static
    const date = cached.headers.get('Date');
    if(date) {
      const diff = Date.now() - Date.parse(date);
      if(diff < DYNAMIC_TTL * 1000) return cached;
    }
  }

  // fetch - if error return old version
  const ttl = cmd ? DYNAMIC_TTL : STATIC_TTL;
  const init: RequestInit = { cf: { cacheTtl: ttl } } as any;
  const resp2 = await fetch(req || request, init);
  if(!resp2.ok) return cached || resp2;

  // convert and maybe cache
  const resp3 = cmd ? await api2response(resp2, cmd, arg) : resp2;
  if(cache && resp3.ok &&
      (cmd === 'news' || cmd === 'newest' || arg === '1' ||
      (config.worker !== 'cf' ? resp3.type === 'basic' : resp3.url === MAIN_SITE_INDEX))) {
    const p = cache.put(request, resp3.clone());
    evt?.waitUntil(p);
  }
  return resp3;
}

async function api2response(resp: Response, cmd: string, arg: string) {
  const data = await resp.json();
  let html = renderToMarkup(cmd, arg, data);
  if(isServer) {
    const sections = await getIndexStrs();
    if(sections) html = sections[0] + html + sections[2];
  }
  return html2response(html, DYNAMIC_TTL);
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

async function getIndexStrs() {
  return indexStrs || await setupIndexStrs();
}

async function setupIndexStrs(server?: boolean) {
  mylog('setupIndexStrs', server);
  if(!indexStrs) {
    if(server !== undefined) isServer = server;
    const url = isServer ? MAIN_SITE_INDEX : '/public/index.html';
    const resp = await cacheFetch(url);
    if(resp.ok) {
      const index = await resp.text();
      indexStrs = splitIndexMain(index);
      if(!isServer) {
        const cache = await getCache();
        cache?.put('./', html2response(indexStrs[0] + indexStrs[2], STATIC_TTL));
      }
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

function request2cmd(request: RequestInfo) {
  const path = typeof request === 'string' ? request
    : new URL(request.url).pathname;
  const strs = path.split('/');
  const api = path === '/' || strs[1] === 'myapi';
  const cmd = !api ? '' : strs[2] || 'news';
  const arg = !api ? '' : strs[3] || '1';
  const req = !api ? '' : cmd2url(cmd, arg);
  return { cmd, arg, req };
}

function cmd2url(cmd: string, arg: string) {
  return cmd === 'newest'
  ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
  : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
}


function updateConfig(args: string[]): void {
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if(key in config) (<Mapped>config)[key] = value ?? true;
  });
}

async function perftest(items?: any, func?: (str: string) => void): Promise<string> {
  if(!items) {
    const res = await cacheFetch(BASE_URL + '/static/news.json');
    return perftest(await res.json(), func);
  }
  mylog('perftest', config.perftest);
  const iterations = config.perftest < 0 ? -config.perftest
    : config.perftest > 1 ? config.perftest : 10000;
  return perfs(iterations, () => {
    const str = renderToMarkup('news', '1', items);
    if(func) func(str);
  });
}

function perfs(iterations: number, func: () => void) {
  const start = Date.now();
  for(let i = iterations; i > 0; --i) func();
  const end = Date.now();
  const duration = (end - start) / 1000.0;
  const tps = (iterations / duration).toFixed();
  const str = 'iterations: ' + iterations + '  duration: ' + duration + '  tps: ' + tps;
  mylog(str);
  return str;
}
