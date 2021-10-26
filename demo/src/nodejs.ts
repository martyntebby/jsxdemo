/*
  Simple nodejs program to serve static and dynamic demo content.
*/
export { nodejs };
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { mylog, updateConfig, config } from './misc';
import { path2cmd } from './control';
import { renderToMarkup } from './view';
import { setIndexHtml } from './indexes';
import { perftest, tests } from './tests';

function nodejs() {
  mylog('nodejs');
  updateConfig(process.argv.slice(2));
  config.worker = 'node';
  if(config.tests) doTests(); else doServer();
}

function doTests() {
  tests();
  const news = fs.readFileSync('public/static/news.json', 'utf8');
  const json = JSON.parse(news);
  perftest(json);
  process.exit();
}

function doServer() {
  const indexStr = fs.readFileSync('public/index.html', 'utf8');
  setIndexHtml(indexStr);
  const server = http.createServer(serverRequest).listen(config.port);
  mylog('listening', server.address());
}

function serverRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  let url = req.url;
  mylog('serverRequest', url);
  if(!url) return;
  if(url === '/') {
    res.statusCode = 301;
    res.setHeader('Location', '/public/');
    res.end();
    return;
  }
  if(url.startsWith('/public/')) {
    serveFile(url, res);
  }
  else if(url.startsWith('/myapi/')) {
    serveNews(url, res);
  }
  else {
    mylog('unhandled url:', url);
    res.statusCode = 404;
    res.end();
  }
}

// hack - should handle with nginx, express, etc.
function serveFile(url: string, res: http.ServerResponse) {
  const pos = url.indexOf('?');
  if(pos > 0) url = url.substring(0, pos);
  if(url === '/public/') url = '/public/index.html';
  fs.readFile('.' + url, null, (err, data) => {
    if(err) mylog(err.message);
    const type = url.endsWith('.js') ? 'application/javascript' : '';
    setHeaders(res, 3600, type);
    res.end(data);
  });
}

function serveNews(path: string, res: http.ServerResponse) {
  setHeaders(res, 600, 'text/html');
  const { cmd, arg, url } = path2cmd(path);
  function sendResp(data: unknown) {
    res.end(renderToMarkup(data, cmd, arg));
  }
  fetchJson(url, sendResp);
}

function setHeaders(res: http.ServerResponse, ttl: number, type: string) {
  res.statusCode = 200;
  res.setHeader('Date', new Date().toUTCString());
  res.setHeader('Cache-Control', 'max-age=' + ttl);
  if(type) res.setHeader('Content-Type', type);
}

function fetchJson(url: string, sendResp: (data: unknown) => void) {
  mylog('fetchJson', url);
  https.get(url, clientRequest2)
    .on('error', err => sendResp(err.message));

  function clientRequest2(res2: http.IncomingMessage) {
    if(res2.statusCode !== 200) {
      res2.resume();
      sendResp(res2.statusCode + ': ' + res2.statusMessage);
    }
    else {
      let data = '';
      res2.on('data', chunk => data += chunk);
      res2.on('end', () => {
        try {
          const json = JSON.parse(data);
          data = !json ? 'No data' : json.error ? json.error.toString() : json;
        }
        catch(err) {
          mylog('Error', err);
          data = '' + err;
        }
        sendResp(data);
      });
    }
  }
}
