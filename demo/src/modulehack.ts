/*
  Hacked fake requirejs - use AMD modules with single output file.
*/
function define(name: string, params: string[], func: Function | Object): void {
  const _self = globalThis as unknown as { myexports: any }
  _self.myexports = _self.myexports || {};
  if(typeof func !== 'function') {
    _self.myexports[name] = func;
    return;
  }
  const req = typeof require === 'undefined' ? undefined : require;
  const args = [ req, _self.myexports[name] = {} ];
  for(let i = 2; i < params.length; ++i) {
    args[i] = _self.myexports[params[i]] || (req && req(params[i]));
  }
  func.apply(null, args);
}
