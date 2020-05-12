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
  console.log('serverRequest', req.url);
  if(!req.url) return;

  // hack - should handle with nginx
  if(req.url.startsWith('/public/')) {
    fs.readFile('.' + req.url, 'utf8', (err, data) => {
      if(err) console.log(err.message);
      res.statusCode = 200;
      res.end(data);
    });
    return;
  }

  const { cmd, arg, url } = link2cmd(req.url);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.write(indexHtmlStr.substring(0, mainPos));

  function sendResp(data: any) {
    res.write(renderToMarkup(cmd, arg, data));
    res.end(indexHtmlStr.substring(mainPos));
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
