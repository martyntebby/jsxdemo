/*
  tests
*/
export { tests, perftest, perftestgui, perftestpost };
import { mylog, config, path2cmd } from './misc';
import { cacheFetch } from './control';
import { renderToMarkup } from './view';

let started = 0;

function tests() {
  mylog('tests');
  pathtest(false);
  mylog('finished');
}

function myassert(test: boolean, ...args: any[]) {
  console.assert(test, ...args);
}

function pathtest(log = true) {
  mylog('pathtest');
  const empty = path2cmd('', log);
  const myapi = path2cmd('/myapi', log);
  const search = path2cmd('/myapi/search?query=abc&page=3', log);

  myassert('' === empty.cmd);
  myassert('' === empty.arg);
  myassert('' === empty.url);

  myassert('news' === myapi.cmd);
  myassert('1' === myapi.arg);
  myassert(!!myapi.url);

  myassert('search' === search.cmd);
}

function perftest(data: any) {
  mylog('perftest', config.tests);
  const start = Date.now();
  for(let i = config.tests; i > 0; --i) {
    const str = renderToMarkup(data, 'news', '1');
  }
  return perfstr(start);
}

function perftestgui(): void {
  mylog('perftestgui', config.tests);
  if(config.tests > 0) {
    perftestasync();
    return;
  }
  if(started) {
    mylog('stop');
    started = 0;
    return;
  }
  started = Date.now();
  perftestpost(-config.tests);
}

async function perftestasync() {
  const resp = await cacheFetch(config.baseurl + '/static/news.json');
  const data = await resp.json();
  const main = document.getElementById('main')!;
  main.innerHTML = 'perftest ' + config.tests + ' ...';
  main.innerHTML = perftest(data);
}

async function perftestpost(count: number) {
  if(!started) return;
  const main = document.getElementById('main')!;
  if(count > 0) {
    const resp = await cacheFetch('/myapi/ask/2');
    main.innerHTML = await resp.text();
    window.postMessage(count - 1, '*');
  }
  else {
    main.innerHTML = perfstr(started);
    started = 0;
  }
}

function perfstr(start: number) {
  const duration = (Date.now() - start) / 1000;
  const iterations = Math.abs(config.tests);
  const ips = (iterations / duration).toFixed();
  const str = 'iterations: ' + iterations + ', duration: ' + duration + ', ips: ' + ips;
  mylog(str);
  return str;
}
