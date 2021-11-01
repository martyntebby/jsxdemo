/*
  Runs when page is loaded:
  updates config info from query params
  gets news data if main element is empty
  installs event listeners to fetch further data
  registers service worker
*/
export { browser };
import { mylog, config, updateConfig } from './misc';
import { setDirect, clientRequest } from './browser2';
import { setupHandlers } from './onevents';
import { renderToMarkup } from './view';

function browser() {
  mylog('browser');
  if(!('fetch' in window)) {
    swfail('Browser not supported.', 'Missing fetch.');
    return;
  }

  const query = window.location.search;
  if(query) updateConfig(query.substring(1).split('&'));

  const main = document.getElementById('main')!;
  if(!main.firstElementChild) clientRequest();

  setupHandlers();
  startWorker();
}

function startWorker() {
  if(config.worker === 'service' && !config.tests) {
    if('serviceWorker' in navigator) {
      // using main.js does not get swapped out - probably because of self caching
      navigator.serviceWorker.register('sw.js')
        .then(reg => { setDirect(); mylog(reg) },
              err => swfail('ServiceWorker failed.', err));
    }
    else {
      swfail('ServiceWorker unsupported.', '');
    }
  }
}

function swfail(summary: string, reason: string) {
  mylog('sw failed:', summary, reason);
  const error = document.getElementById('error')!;
  const details = reason +
    '<br><br>Ensure cookies are enabled, the connection is secure,' +
    ' the browser is not in private mode and is supported' +
    ' (Chrome on Android, Safari on iOS).';
  error.outerHTML = renderToMarkup(details, 'error', summary);
}
