/*
  Hacked fake requirejs - use AMD modules with single output file.
*/
function define(name: string, params: string[], func: Function | Object): void {
  name = fixModuleName(name);
  const _self = globalThis as unknown as { myexports: {[key: string]: unknown } }
  _self.myexports = _self.myexports || {};
  if(typeof func !== 'function') {
    _self.myexports[name] = func;
    return;
  }
  const req = typeof require === 'undefined' ? undefined : require;
  const args = [ req, _self.myexports[name] = {} ];
  for(let i = 2; i < params.length; ++i) {
    const name2 = fixModuleName(params[i]);
    args[i] = _self.myexports[name2] || (req && req(name2));
  }
  func.apply(null, args);
}

function fixModuleName(name: string) {
  return name.startsWith('react/jsx-') ? 'src/jsxrender' : name;
}
