/*
  Runs when page is loaded:
  updates config info from query params
  gets news data if main element is empty
  installs event listeners to fetch further data
  registers service worker
*/
export { browser };
import { mylog, config, updateConfig, renderToMarkup } from './control';
import { enableSW, clientRequest } from './browser2';
import { setupHandlers } from './onevents';

async function browser() {
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
  if(config.worker === 'service' && !config.perftest) {
    if('serviceWorker' in navigator) {
      // using main.js does not get swapped out - probably because of self caching
      navigator.serviceWorker.register('sw.js')
        .then(reg => {enableSW(); mylog(reg)}, err => swfail('ServiceWorker failed.', err));
    }
    else {
      swfail('ServiceWorker unsupported.', '');
    }
  }
}

function swfail(summary: string, reason: string) {
  mylog('sw failed:', summary, reason);
  const error = document.getElementById('error')!;
  error.outerHTML = renderToMarkup('', summary, reason +
    '<br><br>Ensure cookies are enabled, the connection is secure,' +
    ' the browser is not in private mode and is supported' +
    ' (Chrome on Android, Safari on iOS).');
}
