export { nodejs };
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { link2cmd } from './link2cmd';
import { renderMarkup } from './view';

let indexHtmlStr = '';
let mainPos = 0;

function nodejs() {
  const port = 3000;
  console.log('nodejs', port);
  indexHtmlStr = fs.readFileSync('dist/index.html', 'utf8');
  mainPos = indexHtmlStr.indexOf('</main>');
  http.createServer(serverRequest).listen(port);
}

function serverRequest(req: http.IncomingMessage, res: http.ServerResponse) {
  console.log('serverRequest', req.url);
  if(!req.url) return;

  if(req.url.startsWith('/demo/') || req.url.startsWith('/dist/')) {
    fs.readFile('.' + req.url, 'utf8', (err, data) => {
      if(err) console.log(err.message);
      res.statusCode = 200;
      res.end(data);
    });
    return;
  }

  const { cmd, arg, url } = link2cmd(req.url, 0);

  function sendResp(data: any) {
    const main = renderMarkup(cmd, arg, data);
    const html = indexHtmlStr.substring(0,mainPos) + main + indexHtmlStr.substring(mainPos);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
  }

  https.get(url, res2 => {
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
  }).on('error', err => {
    sendResp(err.message);
  })
}
