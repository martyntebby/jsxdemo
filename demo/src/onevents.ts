/*
  browser event handlers
*/
export { setupHandlers };
import { fetchPaint } from './browser2';
import { perfTestGui, perfTestPost } from './tests2';

function setupHandlers() {
  window.onmessage = onMessage;
  window.onpopstate = onPopState;
  document.body.onclick = onClick;
  document.body.onsubmit = onSubmit;
}

function onMessage(e: MessageEvent) {
  perfTestPost(e.data);
}

function onPopState(e: PopStateEvent) {
  fetchPaint(e.state);
}

function onClick(e: Event) {
  if(e.target instanceof HTMLAnchorElement) {
    const cmd = e.target.dataset.cmd;
    if(cmd !== undefined) {
      e.preventDefault();
      if(cmd === 'perftest') return perfTestGui();
      const path = cmd || e.target.pathname;
      window.history.pushState(path, '');
      document.forms[0].reset();
      fetchPaint(path);
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
      fetchPaint(path);
    }
  }
}
