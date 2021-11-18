/*
  Runs when page is loaded:
  updates config info from query params
  gets news data if main element is empty
  installs event listeners to fetch further data
  registers service worker
*/
export { browser };
import { mylog, updateConfig } from './misc';
import { setWorker, fetchPaint } from './browser2';
import { setupHandlers } from './onevents';
import { renderToMarkup } from './view';

function browser() {
  mylog('browser');
  const nav = document.getElementById('nav')!;
  nav.className = 'other';

  if(!('fetch' in window)) {
    showFail('Browser not supported.', 'Missing fetch.');
    return;
  }

  const query = window.location.search;
  const args = query ? query.substring(1).split('&') : [];
  const config = updateConfig(args);

  const main = document.getElementById('main')!;
  if(!main.firstElementChild) fetchPaint();

  setupHandlers();
  if(!config.tests) startWorker(true);
}

function showFail(summary: string, reason: string) {
  mylog('fail:', summary, reason);
  const details = reason +
    '<br><br>Ensure cookies are enabled, the connection is secure,' +
    ' the browser is not in private mode and is supported' +
    ' (Chrome on Android, Safari on iOS).';
    const error = document.getElementById('error')!;
    error.outerHTML = renderToMarkup(details, 'error', summary);
}

function startWorker(service?: boolean) {
  const script = 'sw.js';
  if(service) {
    if('serviceWorker' in navigator) {
      // using main.js does not get swapped out - probably because of self caching
      navigator.serviceWorker.register(script)
        .then(reg => { mylog(reg); setWorker(); },
              err => { showFail('Service Worker failed.', err); startWorker(); });
    }
    else {
      showFail('Service Worker not supported.', '');
      startWorker();
    }
  }
  else {
    if(window.Worker) {
      setWorker(new Worker(script));
    }
    else {
      showFail('Worker not supported.', '');
    }
  }
}
