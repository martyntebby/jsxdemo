
main();

function main() {
  doFetch(document.location.pathname);
  document.body.onclick = onClick;
  window.onpopstate = onPopState;
}

function onClick(e: Event) {
  if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
    doFetch(e.target.pathname, true);
    e.preventDefault();
  }
}

function onPopState(e: Event) {
  doFetch(document.location.pathname);
}

async function doFetch(path: string, updateHistory?: boolean) {
  console.log('doFetch', path);
  const strs = path.split('/');
  if(strs[1] === 'index.html') strs[1] = '';
  const cmd = strs[1] || 'news';
  const arg = strs[2] || '1';
  const url = 'http://node-hnapi.herokuapp.com/' + cmd +
    ((cmd === 'user' || cmd === 'item') ? '/' : '?page=') + arg;

  const vnode = fetchFormat(url, cmd, arg);
  const elem = document.getElementsByTagName('main')[0];
  elem.firstElementChild!.className = 'fade';
  if (updateHistory) {
    const path = '/' + cmd + '/' + arg;
    window.history.pushState({}, '', path);
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
