const prepath = document.location.pathname.substring(
  0, document.location.pathname.lastIndexOf('/'));

main();

function main() {
  doFetch(document.location.pathname);
  document.body.onclick = onClick;
  window.onpopstate = onPopState;
}

function onClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
    doFetch(prepath + e.target.pathname, true);
    e.preventDefault();
  }
}

function onPopState(e: Event) {
  doFetch(document.location.pathname);
}

function link2cmd(pathname: string) {
  const strs = pathname.substring(prepath.length).split('/');
  if(strs[1] === 'index.html') strs[1] = '';
  const cmd = strs[1] || 'news';
  const arg = strs[2] || '1';
  const url = 'https://node-hnapi.herokuapp.com/' + cmd +
    ((cmd === 'user' || cmd === 'item') ? '/' : '?page=') + arg;
  return { cmd, arg, url };
}

async function doFetch(pathname: string, updateHistory?: boolean) {
  console.log('doFetch', pathname);
  const { cmd, arg, url } = link2cmd(pathname);
  const vnode = fetchFormat(url, cmd, arg);
  const elem = document.getElementsByTagName('main')[0];
  elem.firstElementChild!.className = 'loading';
  if (updateHistory) {
    window.history.pushState({}, '', pathname);
  }
  render((await vnode) as any, elem);
}

async function fetchFormat(url: string, cmd: string, arg: string) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return ErrorView(resp.statusText);
    const json = await resp.json();
    return json.error ? ErrorView(json.error) :
      cmd === 'user' ? UserView({ user: json }) :
        cmd === 'item' ? ItemView({ item: json }) :
          ItemsView({ items: json, cmd: cmd, page: Number.parseInt(arg) });
  }
  catch (err) {
    return ErrorView(err.toString());
  }
}
