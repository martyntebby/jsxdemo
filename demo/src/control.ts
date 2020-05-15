export { fetchData, fetchMarkup, link2cmd, myapi };
export { renderToMarkup } from './view';
import { mylog, renderToMarkup } from './view';

const myapi = '/myapi/';

async function fetchMarkup(path?: string, init?: RequestInit, useapi?: boolean) {
  mylog('fetchMarkup', path, useapi);
  const { cmd, arg, url } = link2cmd(path, useapi);
  const data = await fetchData(url, init, !useapi);
  const html: string = useapi ? data : renderToMarkup(cmd, arg, data);
  return { html, cmd, arg };
}

function link2cmd(path?: string, useapi?: boolean) {
  path = path || '';
  const strs = path.split('/');
  const cmd = strs[1] || 'news';
  const arg = strs[2] || '1';
  const url = cmd2url(cmd, arg, useapi);
  return { cmd, arg, url };
}

async function fetchData(url: string, init?: RequestInit, json?: boolean) {
  mylog('fetchData', url);
  try {
    const resp = await fetch(url, init);
    if (!resp.ok) return resp.statusText;
    const datap = json ? resp.json() : resp.text();
    const data = await datap;
    return !data ? 'No data' : data.error ? data.error.toString() : data;
  }
  catch (err) {
    return err.toString();
  }
}

function cmd2url(cmd: string, arg: string, useapi?: boolean) {
  return useapi ? `${myapi}${cmd}/${arg}`
  : cmd === 'newest'
  ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
  : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
}
