/*
  Implements React.createElement (and experimental jsx/jsxs)
  to return string instead of JSX.Element.
*/
export { h, h as createElement, jsx, jsx as jsxs, Fragment, renderToStaticMarkup };

type Props = { [key: string]: any };
type NodeType = string | number | boolean | NodeType[] | null | undefined;
type ElementType = string;

function h(type: string|Function, props: Props|null, ...children: NodeType[]): ElementType {
  if(typeof type === 'string') {
    return doElement(type, props, children);
  }
  if(type === Fragment) {
    return doChildren(children);
  }
  props = props || {};
  props.children = children;
  return type(props);
}

// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md
// https://babeljs.io/blog/2020/03/16/7.9.0

function jsx(type: string|Function, props: Props, key?: any): ElementType {
  if(type === Fragment) return doChildren(props.children);
  if(typeof type === 'function') return type(props);
  return doElement(type, props, props.children);
}

function Fragment(props: Props): ElementType {
  return doChildren(props.children);
}

function renderToStaticMarkup(element: ElementType): string {
  return element;
}

function doElement(type: string, props: Props|null, children: NodeType): string {
  let str = '<' + type;
  for(const name in props) str += doProp(name, props[name]);
  return str + '>' + doChildren(children) + '</' + type + '>';
}

function doChildren(children: NodeType): string {
  if(children == null || typeof children === 'boolean') return '';
  if(typeof children === 'number') return children.toString();
  if(typeof children === 'string') return children;
  let str = '';
  for(const child of children) str += doChildren(child);
  return str;
}

function doProp(name: string, value: any): string {
  if(name === 'children' || name === 'key' || name === 'ref' ||
      value == null || value === false) return '';
  if(name === 'className') name = 'class'
  else if(name === 'forHtml') name = 'for'
  else if(name === 'defaultValue') name = 'value'
  else if(name === 'style' && typeof value === 'object') value = doStyle(value);
  else if(value === true) value = '';
  return ' ' + name + '="' + value + '"';
}

function doStyle(style: any): string { // slow
  return Object.keys(style).map(key => {
    const key2 = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${key2}:${style[key]}`;
  }).join(';');
}
