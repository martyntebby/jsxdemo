/*
  in browser tests
*/
export { perfTestGui, perfTestPost };
import { mylog, config } from './misc';
import { cacheFetch } from './control';
import { perfTest, perfStr } from './tests';

let started = 0;

function perfTestGui(): void {
  mylog('perftestgui', config.tests);
  if(config.tests > 0) {
    perfTestFast();
    return;
  }
  if(started) {
    mylog('stop');
    started = 0;
    return;
  }
  started = Date.now();
  perfTestPost(-config.tests);
}

async function perfTestFast() {
  const resp = await cacheFetch(config.baseurl + '/static/news.json');
  const data = await resp.json();
  const main = document.getElementById('main')!;
  main.innerHTML = 'perftest ' + config.tests + ' ...';
  main.innerHTML = perfTest(data);
}

async function perfTestPost(count: number) {
  if(!started) return;
  const main = document.getElementById('main')!;
  if(count > 0) {
    const resp = await cacheFetch('/myapi/ask/2');
    main.innerHTML = await resp.text();
    window.postMessage(count - 1, '*');
  }
  else {
    main.innerHTML = perfStr(started);
    started = 0;
  }
}
