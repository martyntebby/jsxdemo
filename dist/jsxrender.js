export { render, renderToString, createElement, h, Fragment };
function render(element, container) {
    container.innerHTML = renderToString(element);
}
function renderToString(element) {
    const { type, props, children } = element;
    let str = '';
    if (type) {
        str += '<' + type;
        for (const name in props) {
            str += doProp(name, props[name]);
        }
        str += '>';
    }
    if (children)
        str += doChildren(children);
    if (type)
        str += '</' + type + '>';
    return str;
}
function createElement(type, props, ...children) {
    props = props || {};
    if (typeof type === 'function') {
        props.children = children;
        return type(props);
    }
    return { type, props, children };
}
const h = createElement;
function Fragment(props) {
    return createElement('', null, ...props.children);
}
function doProp(name, value) {
    if (name === 'key' || name === 'ref' || value == null || value === false)
        return '';
    if (name === 'className')
        name = 'class';
    else if (name === 'forHtml')
        name = 'for';
    else if (name === 'defaultValue')
        name = 'value';
    else if (name === 'style' && typeof value === 'object') {
        value = Object.keys(value).map(key => `${key}:${value[key]};`).join('');
    }
    return ' ' + name + '="' + value + '"';
}
function doChildren(children) {
    let str = '';
    for (const child of children) {
        if (child == null || typeof child === 'boolean') { }
        else if (Array.isArray(child))
            str += doChildren(child);
        else if (typeof child === 'object')
            str += renderToString(child);
        else
            str += child;
    }
    return str;
}
