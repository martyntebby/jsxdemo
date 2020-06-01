export { h, h as createElement, jsx, jsx as jsxs, Fragment, renderToStaticMarkup };
function h(type, props, ...children) {
    if (typeof type === 'string')
        return doElement(type, props, children);
    if (type === Fragment)
        return doChildren(children);
    props = props || {};
    props.children = children;
    return type(props);
}
function jsx(type, props, key) {
    if (typeof type === 'string')
        return doElement(type, props, [props.children]);
    if (type === Fragment)
        return doChildren([props.children]);
    return type(props);
}
function Fragment(props) {
    return doChildren([props.children]);
}
function renderToStaticMarkup(element) {
    return element;
}
function doElement(type, props, children) {
    let str = '<' + type;
    for (const name in props)
        str += doProp(name, props[name]);
    return str + '>' + doChildren(children) + '</' + type + '>';
}
function doChildren(children) {
    let str = '';
    for (const child of children) {
        if (typeof child === 'string')
            str += child;
        else if (typeof child === 'number')
            str += child.toString();
        else if (typeof child === 'boolean' || child === null || child === undefined) { }
        else
            str += doChildren(child);
    }
    return str;
}
function doChild(child) {
    if (typeof child === 'string')
        return child;
    if (typeof child === 'number')
        return child.toString();
    if (typeof child === 'boolean' || child === null || child === undefined)
        return '';
    let str = '';
    for (const child2 of child)
        str += doChild(child2);
    return str;
}
function doProp(name, value) {
    if (name === 'children' || name === 'key' || name === 'ref' ||
        value === null || value === undefined || value === false)
        return '';
    if (name === 'className')
        name = 'class';
    else if (name === 'forHtml')
        name = 'for';
    else if (name === 'defaultValue')
        name = 'value';
    else if (name === 'style' && typeof value === 'object')
        value = doStyle(value);
    else if (value === true)
        value = '';
    return ' ' + name + '="' + value + '"';
}
const styleRegex = /([A-Z])/g;
function doStyle(style) {
    return Object.keys(style).map(key => {
        const key2 = key.replace(styleRegex, '-$1');
        return key2.toLowerCase() + ':' + style[key];
    }).join(';');
}
