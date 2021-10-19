/*
  Main entry point.
  Determines environment type and dispatchs to appropriate function.
*/
import { mylog, version, config } from './misc';
import { nodejs } from './nodejs';
import { denojs } from '../src2/denojs';
import { browser } from './browser';
import { worker, sworker, cfworker } from './worker';

main();

function main() {
  mylog('main', version);
  start();
  mylog('config:', JSON.stringify(config));
}

function start() {
  if('Deno' in globalThis) denojs();
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
