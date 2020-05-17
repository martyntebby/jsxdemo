export { nodejs };
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { link2cmd, renderToMarkup } from './control';

let indexHtmlStr = '';
let mainPos = 0;

function nodejs() {
  const port = 3000;
  console.log('nodejs', port);
  indexHtmlStr = fs.readFileSync('public/index.html', 'utf8');
  mainPos = indexHtmlStr.indexOf('</main>');
  http.createServer(serverRequest).listen(port);
}

function serverRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  let url = req.url;
  console.log('serverRequest', url);
  if(!url) return;

  // hack - should handle with nginx
  if(url.startsWith('/static/')) url = '/public' + url;
  if(url.startsWith('/public/')) {
    fs.readFile('.' + url, null, (err, data) => {
      if(err) console.log(err.message);
      res.statusCode = 200;
      res.end(data);
    });
    return;
  }
  serveNews(url, res);
}

function serveNews(url1: string, res: http.ServerResponse) {
  const { cmd, arg, url } = link2cmd(url1);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(indexHtmlStr.substring(0, mainPos));

  https.get(url, clientRequest)
    .on('error', err => sendResp(err.message))

  function sendResp(data: any) {
    res.write(renderToMarkup(cmd, arg, data));
    res.end(indexHtmlStr.substring(mainPos));
  }

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
