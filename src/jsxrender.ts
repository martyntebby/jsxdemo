export { h, h as createElement, Fragment, render, renderToStaticMarkup };

type Props = { [key: string]: any };
type NodeType = string | number | boolean | NodeType[] | null | undefined;
type ElementType = string;

function h(type: string|Function, props: Props|null, ...children: NodeType[]): ElementType {
  if(typeof type === 'string') {
    return doElement(type, props, children);
  }
  if(type === Fragment) { // minor optimization
    return doChildren(children);
  }
  props = props || {};
  props.children = children;
  return type(props);
}

function Fragment(props: Props) {
  return doChildren(props.children);
}

function render(element: ElementType, container: Element): void {
  container.innerHTML = renderToStaticMarkup(element);
}

function renderToStaticMarkup(element: ElementType): string {
  return element;
}

function doElement(type: string, props: Props|null, children: NodeType[]): string {
  let str = '<' + type;
  for(const name in props) str += doProp(name, props[name]);
  return str + '>' + doChildren(children) + '</' + type + '>';
}

function doProp(name: string, value: any): string {
  if(name === 'key' || name === 'ref' ||
      value == null || value === false) return '';
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
