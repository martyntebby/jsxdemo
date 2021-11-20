/*
  Simple nodejs program to serve static and dynamic demo content.
*/
export { nodejs };
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { mylog, updateConfig, path2cmd } from './misc';
import { newHeaders, modFilePath, fileResp, otherResp } from './server';
import { renderToMarkup } from './view';
import { setIndexHtml } from './indexes';
import { perfTest, tests } from './tests';

let indexes: string[];

interface MyResponse {
  status: number;
  statusText?: string;
  headers?: http.OutgoingHttpHeaders;
  body?: string | Uint8Array;
};

function nodejs() {
  mylog('nodejs');
  const config = updateConfig(process.argv.slice(2), {worker: 'node'});
  if(config.tests) doTests(config.tests); else doServer(config.port);
}

function doTests(numTests: number) {
  tests();
  if(numTests == 1) return;
  const news = fs.readFileSync('public/static/news.json', 'utf8');
  const json = JSON.parse(news);
  perfTest(json);
}

function doServer(port: number) {
  const indexStr = fs.readFileSync('public/index.html', 'utf8');
  indexes = setIndexHtml(indexStr);
  const server = http.createServer(onRequest).listen(port);
  mylog('listening', server.address());
}

async function onRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  try {
    const resp = await doGet('' + req.url);
    // add some headers
    res.writeHead(resp.status, resp.statusText, resp.headers);
    res.write(resp.body);
  }
  catch(err) {
    res.statusCode = 500;
    res.statusMessage = '' + err;
  }
  res.end();
}

function doGet(path: string) {
  mylog('doGet', path);
  if(path.startsWith('/myapi/')) return doApi(path);
  path = modFilePath(path);
  if(path.startsWith('/public/')) return doFile('.' + path);
  return otherResp(path) as MyResponse;
}

function doFile(path: string) {
  return new Promise<MyResponse>((resolve, reject) => {
    fs.readFile(path, null, (err, data) => {
      if(err) mylog(err.message);
      resolve(fileResp(path, data));
    });
  });
}

async function doApi(path: string) {
  const { cmd, arg, url } = path2cmd(path);
  const resp = await httpsGet(url);
  if(resp.status === 200) {
    const json = JSON.parse(resp.body as string);
    const data = !json ? 'No data' : json.error ? json.error.toString() : json;
    const html = renderToMarkup(data, cmd, arg, indexes);
    resp.headers = newHeaders(600, 'text/html', html.length);
    resp.body = html;
  }
  return resp;
}

function httpsGet(url: string) {
  return new Promise<MyResponse>((resolve, reject) => {
    https.get(url, res => {
      const resp = {
        status: res.statusCode || 500,
        statusText: res.statusMessage,
        headers: res.headers,
        body: '',
      }
      res.on('data', chunk => resp.body += chunk);
      res.on('end', () => resolve(resp));
    })
    .on('error', err => reject(err.message));
  });
}
