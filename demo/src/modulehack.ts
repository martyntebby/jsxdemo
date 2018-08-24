// hacked fake requirejs - use AMD modules with single output file

interface MySelf { myexports: any }

function define(name: string, params: string[], func: Function) {
  // @ts-ignore: Window | Global not assignable to MySelf
  const _self: MySelf = typeof self === 'object' ? self : global;
  _self.myexports = _self.myexports || {};
  const req = typeof require === 'undefined' ? undefined : require;
  const args = [ req, _self.myexports[name] = {} ];
  for(let i = 2; i < params.length; ++i) {
    args[i] = _self.myexports[params[i]] || (req && req(params[i]));
  }
  func.apply(null, args);
}
