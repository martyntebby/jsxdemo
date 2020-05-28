/*
  Implements React.createElement (and experimental jsx/jsxs)
  to return string instead of JSX.Element.
*/
export { h, h as createElement, jsx, jsx as jsxs, Fragment, renderToStaticMarkup };

type Indexed = { [key: string]: unknown; };
type Props = Indexed & { children?: NodeType; };
type NodeType = string | number | boolean | NodeType[] | null | undefined;
type ElementType = string;

function h(type: string|Function, props: Props|null, ...children: NodeType[]): ElementType {
  if(typeof type === 'string') return doElement(type, props, children);
  if(type === Fragment) return doChildren(children);
  props = props || {};
  props.children = children;
  return type(props);
}

// https://github.com/reactjs/rfcs/blob/createlement-rfc/text/0000-create-element-changes.md
// https://babeljs.io/blog/2020/03/16/7.9.0

function jsx(type: string|Function, props: Props, key?: unknown): ElementType {
  if(typeof type === 'string') return doElement(type, props, props.children);
  if(type === Fragment) return doChildren(props.children);
  return type(props);
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
  if(typeof children === 'string') return children;
  if(typeof children === 'number') return children.toString();
  if(typeof children === 'boolean' || children === null || children === undefined) return '';
  let str = '';
  for(const child of children) str += doChildren(child);
  return str;
}

function doProp(name: string, value: unknown): string {
  if(name === 'children' || name === 'key' || name === 'ref' ||
      value === null || value === undefined || value === false) return '';
  if(name === 'className') name = 'class'
  else if(name === 'forHtml') name = 'for'
  else if(name === 'defaultValue') name = 'value'
  else if(name === 'style' && typeof value === 'object') value = doStyle(<Indexed>value);
  else if(value === true) value = '';
  return ' ' + name + '="' + value + '"';
}

const styleRegex = /([A-Z])/g;

function doStyle(style: Indexed): string {
  return Object.keys(style).map(key => {
    const key2 = key.replace(styleRegex, '-$1'); // slow
    return key2.toLowerCase() + ':' + style[key];
  }).join(';');
}
