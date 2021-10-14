/*
  perftest
*/
export { perftest, perftestgui, perftestpost };
import { mylog, config, renderToMarkup, cacheFetch } from './control';
import { fetchPath } from './browser2';

let started = 0;

async function perftest(items?: any): Promise<string> {
  mylog('perftest', config.perftest);
  if(!items) {
    const res = await cacheFetch(config.baseurl + '/static/news.json');
    items = await res.json();
  }
  const start = Date.now();
  for(let i = config.perftest; i > 0; --i) {
    const str = renderToMarkup('news', '1', items);
  }
  return perfstr(start);
}

function perftestgui(): void {
  mylog('perftestgui', config.perftest);
  if(config.perftest > 0) {
    perftestasync();
    return;
  }
  if(started) {
    mylog('stop');
    started = 0;
    return;
  }
  started = Date.now();
  window.postMessage(-config.perftest, '*');
}

async function perftestasync() {
  const main = document.getElementById('main')!;
  main.innerHTML = 'perftest ' + config.perftest + ' ...';
  main.innerHTML = await perftest();
}

async function perftestpost(count: number) {
  if(!started) return;
  const main = document.getElementById('main')!;
  if(count > 0) {
    main.innerHTML = await fetchPath('/myapi/ask/2');
    window.postMessage(count - 1, '*');
  }
  else {
    main.innerHTML = perfstr(started);
    started = 0;
  }
}

function perfstr(start: number) {
  const duration = (Date.now() - start) / 1000;
  const iterations = Math.abs(config.perftest);
  const ips = (iterations / duration).toFixed();
  const str = 'iterations: ' + iterations + ' duration: ' + duration + ' fps: ' + ips;
  mylog(str);
  return str;
}
