/*
  Main entry point.
  Determines environment type and dispatchs to appropriate function.
*/
import { mylog, version, config } from './control';
import { nodejs } from './nodejs';
import { browser } from './browser';
import { worker, sworker, cfworker } from './worker';

main();

function main() {
  mylog('main', version);
  if('window' in globalThis) browser();
  else if(typeof process === 'object' && process.version) nodejs();
  // add deno - has no caches
  else if('clients' in globalThis && 'skipWaiting' in globalThis) sworker();
  else if('caches' in globalThis && 'default' in globalThis.caches) cfworker();
  else if('importScripts' in globalThis) worker();
  else {
    console.error('unknown environment', globalThis);
    throw 'unknown environment ' + globalThis;
  }
  mylog('config:', JSON.stringify(config));
}
