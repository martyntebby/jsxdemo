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

function renderToStaticMarkup(element: VNode | JSX.Element): string {
  const { type, props, children } = element as VNode;
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
  else if(name === 'style' && typeof value === 'object') value = doStyle(value);
//  else if(value === true) value = '';
  return ' ' + name + '="' + value + '"';
}

function doStyle(style: any): string {
  return Object.keys(style).map(key => {
    const key2 = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${key2}:${style[key]}`
  }).join(';');
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
