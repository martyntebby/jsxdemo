export { h, h as createElement, Fragment, renderToStaticMarkup };
function h(type, props, ...children) {
    if (typeof type === 'string') {
        return doElement(type, props, children);
    }
    if (type === Fragment) {
        return doChildren(children);
    }
    props = props || {};
    props.children = children;
    return type(props);
}
function Fragment(props) {
    return doChildren(props.children);
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
        if (child == null || typeof child === 'boolean') { }
        else if (Array.isArray(child))
            str += doChildren(child);
        else
            str += child;
    }
    return str;
}
function doProp(name, value) {
    if (name === 'key' || name === 'ref' ||
        value == null || value === false)
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
function doStyle(style) {
    return Object.keys(style).map(key => {
        const key2 = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${key2}:${style[key]}`;
    }).join(';');
}
