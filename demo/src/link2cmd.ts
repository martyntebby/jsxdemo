export { link2cmd };

function link2cmd(pathname: string, prePathLen: number) {
  const strs = pathname.substring(prePathLen).split('/');
  if(strs[1] === 'index.html') strs[1] = '';
  const cmd = strs[1] || 'news';
  const arg = strs[2] || '1';
  const url = false && cmd === 'newest'
  ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
  : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
  return { cmd, arg, url };
}
