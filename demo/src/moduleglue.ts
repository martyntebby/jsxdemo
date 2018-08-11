// hacked fake requirejs - use AMD modules with single output file

interface Window { myexports: any }

function define(name: string, params: string[], func: Function) {
  self.myexports = self.myexports || {};
  const args = [ null, self.myexports[name] = {} ];
  for(let i = 2; i < params.length; ++i) {
    args[i] = self.myexports[params[i]];
  }
  func.apply(null, args);
}
