/*
  config, logging
*/
export { mylog, resetLog, updateConfig, path2cmd };
export { config, version } from '../../package.json';
import { config } from '../../package.json';
import type { Mapped } from './types';

let logs: string[] = [];

function mylog(...args: any[]) {
  console.log(...args);
  if(config.dolog) logs.push(Date.now() + '  ' + args.join('  '));
}

function resetLog() {
  const l = logs;
  logs = [];
  return l;
}

type Config = typeof config;

function updateConfig(args: string[] | Mapped, extra?: Partial<Config>) {
  if(Array.isArray(args)) updateConfig1(args); else updateConfig2(args, true);
  if(extra) updateConfig2(extra, false);
  mylog('config', JSON.stringify(config));
  return config as Readonly<Config>;
}

function updateConfig1(args: string[]) {
  args.forEach(arg => {
    const [key, value] = arg.split('=');
    if(key in config) (<Mapped>config)[key] = value ?? true;
  });
}

function updateConfig2(env: Mapped, upper: boolean) {
  Object.keys(config).forEach(key => {
    const key2 = upper ? key.toUpperCase() : key;
    const value = env[key2];
    if(value != null) (<Mapped>config)[key] = value;
  });
}

function path2cmd(path: string, log?: boolean) {
  const re = /\/|\?/;
  const strs = path.split(re);
  const api = path === '/' || strs[1] === 'myapi'; // not file
  const cmd = !api ? '' : strs[2] || 'news';
  const arg = !api ? '' : strs[3] || '1';
  const url = !api ? '' : cmd2url(cmd, arg);
  const ret = { cmd, arg, url };
  // empty cmd indicates file
  if(log) mylog('path2cmd', path, ret);
  return ret;
}

function cmd2url(cmd: string, arg: string) {
  switch(cmd) {
    case 'search': return `https://hn.algolia.com/api/v1/search_by_date?${arg}&hitsPerPage=50&tags=story`;
    case 'newest': return `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`;
    default: return `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
  }
}
