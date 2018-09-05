export { State, link2cmd };

interface State {
  cmd?: string;
  arg?: string;
}

function link2cmd(pathname: string, prePathLen: number, state?: State|null) {
  state = state || {};
  const strs = pathname.substring(prePathLen).split('/');
  if(strs[1] === 'index.html') strs[1] = '';
  const cmd = state.cmd || strs[1] || 'news';
  const arg = state.arg || strs[2] || '1';
  const url = cmd2url(cmd, arg);
  return { cmd, arg, url };
}

function cmd2url(cmd: string, arg: string) {
  return false && cmd === 'newest'
  ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
  : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
}
