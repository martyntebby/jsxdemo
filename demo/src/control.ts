/*
  Fetches data from hnapi or elsewhere and supplies as json or formatted html.
  Re exports some view methods and handles config info from package.json.
*/
export { fetchMarkup, fetchData, link2cmd, updateConfig, Mapped };
export { mylog, renderToMarkup } from './view';
import { mylog, renderToMarkup } from './view';
export { config, version } from '../../package.json';
import { config } from '../../package.json';

type Mapped = { [key: string]: unknown; };

async function fetchMarkup(path?: string, type?: string, init?: RequestInit) {
  const isApi = !type;
  const { cmd, arg, url } = isApi ? link2cmd(path) : { cmd:type!, arg:'', url:path! };
  const data = await fetchData(url, init, isApi);
  const markup: string = isApi ? renderToMarkup(cmd, arg, data) : data;
  if(config.perftest && cmd === 'news') setTimeout(perftest, 20, data);
  return { markup, cmd, arg };
}

async function fetchData(url: string, init?: RequestInit, json?: boolean) {
  mylog('fetchData', url);
  try {
    const resp = await fetch(url, init);
    if(!resp.ok) return resp.statusText;
    const datap = json ? resp.json() : resp.text();
    const data = await datap;
    return !data ? 'No data' : data.error ? data.error.toString() : data;
  }
  catch (err) {
    return err.toString();
  }
}

function link2cmd(path?: string, useapi?: boolean) {
  path = path || '';
  const strs = path.split('/');
  const cmd = strs[1] || 'news';
  const arg = strs[2] || '1';
  const url = cmd2url(cmd, arg, useapi);
  return { cmd, arg, url };
}

function cmd2url(cmd: string, arg: string, useapi?: boolean) {
  return useapi ? `/myapi/${cmd}/${arg}`
  : cmd === 'newest'
  ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
  : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
}

function updateConfig(args: string[]) {
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if(key in config) (<Mapped>config)[key] = value ?? true;
  });
}

function perftest(items: any) {
  const iterations: number = <any>config.perftest > 1 ? <any>config.perftest : 10000;
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
