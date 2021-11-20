/*
  tests
*/
export { tests, perfTest, perfStr };
import { mylog, config, path2cmd, updateConfig } from './misc';
import { getIndexes, setIndexHtml } from './indexes';
import { modFilePath, fileResp, otherResp } from './server';
import { renderToMarkup } from './view';

function tests() {
  mylog('tests');
  configTest();
  pathTest(false);
  indexTest();
  serverTest();
  mylog('finished');
}

function myassert(test: boolean, ...args: any[]) {
  console.assert(test, ...args);
}

function configTest() {
  mylog('configTest');
  myassert(updateConfig(['worker=worker1']).worker === 'worker1');
  myassert(updateConfig({WORKER:'worker2'}).worker === 'worker2');
  myassert(updateConfig([], {worker:'worker3'}).worker === 'worker3');
}

function pathTest(log = true) {
  mylog('pathTest');
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

function indexTest() {
  mylog('indexTest');
  const init = getIndexes();
  myassert(Array.isArray(init) && init.length === 1);
  myassert(setIndexHtml('').length === 1);
  myassert(setIndexHtml('abc').length === 3);
}

function serverTest() {
  mylog('serverTest');
  myassert(modFilePath('a?b') === 'a');
  myassert(fileResp('abc').status === 404);
  myassert(fileResp('abc.png', new Uint8Array(1)).headers?.['Content-Type'] === 'image/png');
  myassert(otherResp('abc').status === 406);
  myassert(otherResp('/').headers?.Location === '/public/');
}

function perfTest(data: any) {
  mylog('perftest', config.tests);
  const start = Date.now();
  for(let i = config.tests; i > 0; --i) {
    const str = renderToMarkup(data, 'news', '1');
  }
  return perfStr(start);
}

function perfStr(start: number) {
  const duration = (Date.now() - start) / 1000;
  const iterations = Math.abs(config.tests);
  const ips = (iterations / duration).toFixed();
  const str = 'iterations: ' + iterations + ', duration: ' + duration + ', ips: ' + ips;
  mylog(str);
  return str;
}
