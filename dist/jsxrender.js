export { h, h as createElement, Fragment, render, renderToStaticMarkup };
function h(type, props, ...children) {
    props = props || {};
    if (typeof type === 'function') {
        props.children = children;
        return type(props);
    }
    const vnode = { type, props, children };
    return vnode;
}
function Fragment(props) {
    return h('', null, ...props.children);
}
function render(element, container) {
    container.innerHTML = renderToStaticMarkup(element);
}
function renderToStaticMarkup(element) {
    const { type, props, children, markup } = element;
    if (markup !== undefined)
        return markup;
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
function doProp(name, value) {
    if (name === 'key' || name === 'ref' || value == null || value === false)
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
function doChildren(children) {
    let str = '';
    for (const child of children) {
        if (child == null || typeof child === 'boolean') { }
        else if (Array.isArray(child))
            str += doChildren(child);
        else if (typeof child === 'object')
            str += renderToStaticMarkup(child);
        else
            str += child;
    }
    return str;
}
function doStyle(style) {
    return Object.keys(style).map(key => {
        const key2 = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${key2}:${style[key]}`;
    }).join(';');
}
