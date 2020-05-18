import { version, config } from './control';
import { nodejs } from './nodejs';
import { browser } from './browser';
import { cfworker } from './cfworker';
import { mylog } from './view';

main();

function main() {
  mylog('main', version);
  if('window' in globalThis) browser();
  else if(typeof process === 'object' && process.version) nodejs();
  else if('caches' in globalThis && 'default' in globalThis.caches) cfworker();
  else if('clients' in globalThis && 'skipWaiting' in globalThis) mylog('service worker');
  else {
    console.error('unknown environment', globalThis);
    throw 'unknown environment ' + globalThis;
  }
  mylog('config', config);
}
