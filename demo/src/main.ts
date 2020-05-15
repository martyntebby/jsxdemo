import { nodejs } from './nodejs';
import { browser } from './browser';
import { sw } from './sw';
import { cfworker } from './cfworker';

main();

function main() {
  console.log('main');
  if('window' in globalThis) browser();
  else if('serviceWorker' in globalThis) sw();
  else if(typeof process === 'object' && process.version) nodejs();
  else if('caches' in globalThis && 'default' in globalThis.caches) cfworker();
  else console.error('unknown environment', globalThis);
}
