/*
  Simple nodejs program to serve static and dynamic demo content.
*/
export { nodejs };
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { mylog, updateConfig, config, perftest, splitIndexMain, request2cmd, renderToMarkup } from './control';

let indexStrs: string[];

function nodejs() {
  mylog('nodejs');
  updateConfig(process.argv.slice(2));
  if(config.perftest) doPerfTest(); else doServer();
}

function doPerfTest() {
  const news = fs.readFileSync('public/static/news.json', 'utf8');
  const json = JSON.parse(news);
  perftest(json);
  process.exit();
}

function doServer() {
  const indexStr = fs.readFileSync('public/index.html', 'utf8');
  indexStrs = splitIndexMain(indexStr);
  const server = http.createServer(serverRequest).listen(config.port);
  console.log('listen', server.address());
}

function serverRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  let url = req.url;
  mylog('serverRequest', url);
  if(!url) return;
  const pos = url.indexOf('?');
  if(pos > 0) url = url.substring(0, pos);
  if(url === '/') url = '/myapi/';

  // hack - should handle with nginx, express, etc.
  if(url.startsWith('/public/')) {
    fs.readFile('.' + url, null, (err, data) => {
      if(err) mylog(err.message);
      res.statusCode = 200;
      res.end(data);
    });
    return;
  }
  if(url.startsWith('/myapi/')) {
    serveNews(url, res);
  }
  else {
    mylog('unhandled url:', url);
    res.statusCode = 404;
    res.end();
  }
}

function serveNews(path: string, res: http.ServerResponse) {
  const { cmd, arg, req } = request2cmd(path);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(indexStrs[0]);

  function sendResp(data: unknown) {
    res.write(renderToMarkup(cmd, arg, data));
    res.end(indexStrs[2]);
  }

  fetchJson(<string>req, sendResp);
}

function fetchJson(url: string, sendResp: (data: unknown) => void) {
  https.get(url, clientRequest)
    .on('error', err => sendResp(err.message));

  function clientRequest(res2: http.IncomingMessage) {
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
          data = err.toString();
        }
        sendResp(data);
      });
    }
  }
}
