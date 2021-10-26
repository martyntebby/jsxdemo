/*
  browser event handlers
*/
export { setupHandlers };
import { clientRequest } from './browser2';
import { perftestgui, perftestpost } from './tests';

function setupHandlers() {
  window.onmessage = onMessage;
  window.onpopstate = onPopState;
  document.body.onclick = onClick;
  document.body.onsubmit = onSubmit;
}

function onMessage(e: MessageEvent) {
  perftestpost(e.data);
}

function onPopState(e: PopStateEvent) {
  clientRequest(e.state);
}

function onClick(e: Event) {
  if(e.target instanceof HTMLAnchorElement) {
    const cmd = e.target.dataset.cmd;
    if(cmd !== undefined) {
      e.preventDefault();
      if(cmd === 'perftest') return perftestgui();
      const path = cmd || e.target.pathname;
      window.history.pushState(path, '');
      document.forms[0].reset();
      clientRequest(path);
    }
  }
}

function onSubmit(e: Event) {
  if(e.target instanceof HTMLFormElement) {
    const cmd = e.target.dataset.cmd;
    if(cmd !== undefined) {
      e.preventDefault();
      const path = e.target.action + '?query=' + e.target.query.value;
      window.history.pushState(path, '');
      clientRequest(path);
    }
  }
}