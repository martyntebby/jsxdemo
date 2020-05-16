import { version } from './control';
import { nodejs } from './nodejs';
import { browser } from './browser';
import { sw } from './sw';
import { cfworker } from './cfworker';

main();

function main() {
  console.log('main', version);
  if('window' in globalThis) browser();
  else if(typeof process === 'object' && process.version) nodejs();
  else if('caches' in globalThis && 'default' in globalThis.caches) cfworker();
  else if('clients' in globalThis && 'skipWaiting' in globalThis) sw();
  else {
    console.error('unknown environment', globalThis, Object.keys(globalThis));
    throw 'unknown environment ' + globalThis + Object.keys(globalThis);
  }
}
