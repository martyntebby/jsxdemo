/*
  config, logging
*/
export { mylog, resetLog, updateConfig };
export type { Mapped, ExtendableEvent };
export { config, version } from '../../package.json';
import { config } from '../../package.json';

type Mapped = { [key: string]: unknown; };

interface ExtendableEvent {
  waitUntil(f: any): void;
};

let logs: string[] = [];

function mylog(...args: any[]) {
  console.log(...args);
  if(config.dolog) logs.push(Date.now() + '  ' + args.join('  '));
}

function resetLog() {
  var l = logs;
  logs = [];
  return l;
}

function updateConfig(args: string[]): void {
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if(key in config) (<Mapped>config)[key] = value ?? true;
  });
}
