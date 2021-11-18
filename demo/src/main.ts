/*
  Main entry point.
  Determines environment type and dispatchs to appropriate function.
*/
import { mylog, version } from './misc';
import { nodejs } from './nodejs';
import { browser } from './browser';
import { worker, sworker, cfworker } from './worker';
//import { denojs } from '../src2/denojs';

main();

function main() {
  mylog('main', version);
  if('Deno' in globalThis) mylog('Deno not supported');
  else if('window' in globalThis) browser();
  else if(typeof process === 'object' && process.version) nodejs();
  else if('clients' in globalThis && 'skipWaiting' in globalThis) sworker();
  else if('caches' in globalThis && 'default' in globalThis.caches) cfworker();
  else if('importScripts' in globalThis) worker();
  else {
    console.error('unknown environment', globalThis);
    throw 'unknown environment ' + globalThis;
  }
}
