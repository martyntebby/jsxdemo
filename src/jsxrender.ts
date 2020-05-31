/*
  Implements React.createElement (and experimental jsx/jsxs)
  to return string instead of JSX.Element.
*/
export { h, h as createElement, jsx, jsx as jsxs, Fragment, renderToStaticMarkup, logCounts };

type Mapped = { [key: string]: unknown; };
type Props = Mapped & { children?: NodeType; };
type NodeType = NodeType[] | string | number | boolean | null | undefined;
type ElementType = string;

let hCount = 0;
let jsxCount = 0;
let funcCount = 0;
let childrenCount = 0;
let elementCount = 0;
let propCount = 0;

function logCounts() {
  console.log('counts', 'h', hCount, 'jsx', jsxCount, 'func', funcCount, 'children', childrenCount, 'element', elementCount, 'prop', propCount);
  hCount = jsxCount = funcCount = childrenCount = elementCount = propCount = 0;
}

function h(type: string|Function, props: Props|null, ...children: NodeType[]): ElementType {
  ++hCount;
  if(typeof type === 'string') return doElement(type, props, children);
  if(type === Fragment) return doChildren(children);
  props = props || {};
  props.children = children;
  ++funcCount;
  return type(props);
}

// https://github.com/microsoft/TypeScript/issues/34547
// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md
// https://babeljs.io/blog/2020/03/16/7.9.0

function jsx(type: string|Function, props: Props, key?: unknown): ElementType {
  ++jsxCount;
  if(typeof type === 'string') return doElement(type, props, props.children);
  if(type === Fragment) return doChildren(props.children);
  ++funcCount;
  return type(props);
}

function Fragment(props: Props): ElementType {
  return doChildren(props.children);
}

function renderToStaticMarkup(element: ElementType): string {
  return element;
}

function doElement(type: string, props: Props|null, children: NodeType): string {
  ++elementCount;
  let str = '<' + type;
  for(const name in props) str += doProp(name, props[name]);
  return str + '>' + doChildren(children) + '</' + type + '>';
}

function doChildren(children: NodeType): string {
  ++childrenCount;
  if(typeof children === 'string') return children;
  if(typeof children === 'number') return children.toString();
  if(typeof children === 'boolean' || children === null || children === undefined) return '';
  let str = '';
  for(const child of children) str += doChildren(child);
  return str;
}

function doProp(name: string, value: unknown): string {
  ++propCount;
  if(name === 'children' || name === 'key' || name === 'ref' ||
    value === null || value === undefined || value === false) return '';
  if(name === 'className') name = 'class';
  else if(name === 'forHtml') name = 'for';
  else if(name === 'defaultValue') name = 'value';
  else if(name === 'style' && typeof value === 'object') value = doStyle(<Mapped>value);
  else if(value === true) value = '';
  return ' ' + name + '="' + value + '"';
}

const styleRegex = /([A-Z])/g;

function doStyle(style: Mapped): string {
  return Object.keys(style).map(key => {
    const key2 = key.replace(styleRegex, '-$1'); // slow
    return key2.toLowerCase() + ':' + style[key];
  }).join(';');
}
