export { render, renderToStaticMarkup, createElement, h, Fragment };

type Props = { [key: string]: any };

type NodeType = string | number | boolean | VNode | null | undefined;

interface VNode {
  type?: string;
  props: Props;
  children?: NodeType[];
}

function render(element: VNode, container: Element): void {
  container.innerHTML = renderToStaticMarkup(element);
}

function renderToStaticMarkup(element: VNode): string {
  const { type, props, children } = element;
  let str = '';
  if(type) {
    str += '<' + type;
    for(const name in props) {
      str += doProp(name, props[name]);
    }
    str += '>';
  }
  if(children) str += doChildren(children);
  if(type) str += '</' + type + '>';
  return str;
}

function createElement(type: string|Function, props: Props|null, ...children: NodeType[]): VNode {
  props = props || {};
  if(typeof type === 'function') {
    props.children = children;
    return type(props);
  }
  return { type, props, children };
}

const h = createElement;

function Fragment(props: Props) {
  return createElement('', null, ...props.children);
}

function doProp(name: string, value: any): string {
  if(name === 'key' || name === 'ref' || value == null || value === false) return '';
  if(name === 'className') name = 'class'
  else if(name === 'forHtml') name = 'for'
  else if(name === 'defaultValue') name = 'value'
  else if(name === 'style' && typeof value === 'object') {
    value = Object.keys(value).map(key => `${key}:${value[key]};`).join('');
  }
  return ' ' + name + '="' + value + '"';
}

function doChildren(children: NodeType[]): string {
  let str = '';
  for(const child of children) {
    if(child == null || typeof child === 'boolean') {}
    else if(Array.isArray(child)) str += doChildren(child);
    else if(typeof child === 'object') str += renderToStaticMarkup(child);
    else str += child;
  }
  return str;
}
