export { h, h as createElement, Fragment, render, renderToStaticMarkup };

type Props = { [key: string]: any };

type NodeTypeBase = string | number | boolean | VNode | null | undefined;
type NodeType = NodeTypeBase | NodeTypeBase[];

interface VNode {
  type?: string;
  props: Props;
  children?: NodeType[];
  markup?: string;
}

function h(type: string|Function, props: Props|null, ...children: NodeType[]): VNode {
  props = props || {};
  if(typeof type === 'function') {
    props.children = children;
    return type(props);
  }
  const vnode: VNode = { type, props, children };
//  vnode.markup = renderToStaticMarkup(vnode);
  return vnode;
}

function Fragment(props: Props) {
  return h('', null, ...props.children);
}

function render(element: VNode, container: Element): void {
  container.innerHTML = renderToStaticMarkup(element);
}

function renderToStaticMarkup(element: VNode): string {
  const { type, props, children, markup } = element;
  if(markup !== undefined) return markup;
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

function doProp(name: string, value: any): string {
  if(name === 'key' || name === 'ref' || value == null || value === false) return '';
  if(name === 'className') name = 'class'
  else if(name === 'forHtml') name = 'for'
  else if(name === 'defaultValue') name = 'value'
  else if(name === 'style' && typeof value === 'object') value = doStyle(value);
  else if(value === true) value = '';
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

function doStyle(style: any): string { // slow
  return Object.keys(style).map(key => {
    const key2 = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${key2}:${style[key]}`;
  }).join(';');
}
