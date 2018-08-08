"use strict";
//import { doRender } from './view.js';
let prepath;
main();
function main() {
    console.log('main');
    const pathname = document.location.pathname;
    prepath = pathname.substring(0, pathname.lastIndexOf('/'));
    fetchRender(pathname);
    window.onpopstate = onPopState;
    document.body.onclick = onClick;
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js');
    }
}
function onPopState(e) {
    fetchRender(document.location.pathname);
}
function onClick(e) {
    if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
        fetchRender(prepath + e.target.pathname, {});
        e.preventDefault();
    }
}
async function fetchRender(pathname, state) {
    console.log('fetchRender', pathname);
    const { cmd, arg, url } = link2cmd(pathname);
    const datap = doFetch(url);
    if (state)
        window.history.pushState(state, '', pathname);
    const elem = document.getElementsByTagName('main')[0];
    elem.firstElementChild.className = 'loading';
    //  const doRender = (await import('./view.js')).doRender;
    doRender(cmd, arg, await datap, elem);
}
function link2cmd(pathname) {
    const strs = pathname.substring(prepath.length).split('/');
    if (strs[1] === 'index.html')
        strs[1] = '';
    const cmd = strs[1] || 'news';
    const arg = strs[2] || '1';
    const url = 'https://node-hnapi.herokuapp.com/' + cmd +
        ((cmd === 'user' || cmd === 'item') ? '/' : '?page=') + arg;
    return { cmd, arg, url };
}
async function doFetch(url) {
    try {
        const resp = await fetch(url);
        if (!resp.ok)
            return resp.statusText;
        const json = await resp.json();
        return json.error ? json.error.toString() : json;
    }
    catch (err) {
        return err.toString();
    }
}
//export { doRender };
//import { h, render } from './jsxrender.js';
function doRender(cmd, arg, data, elem) {
    const vnode = typeof data === 'string' ? ErrorView(data) :
        cmd === 'user' ? UserView({ user: data }) :
            cmd === 'item' ? ItemView({ item: data }) :
                ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
    render(vnode, elem);
}
function ItemsView(props) {
    return (h("div", null,
        h("ol", { start: (props.page - 1) * 30 + 1 }, props.items.map(item => h("li", null,
            h(ItemView, { item: item })))),
        h("a", { href: `/${props.cmd}/${props.page + 1}`, "data-cmd": true }, "Next Page")));
}
function ItemView(props) {
    const i = props.item;
    const url = i.domain ? i.url : '/' + i.url.replace('?id=', '/');
    const domain = i.domain && h("span", { className: 'smallgrey' },
        "(",
        i.domain,
        ")");
    const points = i.points > 0 && h("span", null,
        i.points,
        " points");
    const user = i.user && h("span", null,
        "by ",
        h(UserNameView, { user: i.user }));
    const comments = i.comments_count > 0 &&
        h("span", null,
            "| ",
            h("a", { href: '/item/' + i.id, "data-cmd": true },
                i.comments_count,
                " comments"));
    return (h("div", null,
        h("a", { href: url, "data-cmd": !i.domain }, i.title),
        " ",
        domain,
        h("div", { className: 'smallgrey' },
            points,
            " ",
            user,
            " ",
            i.time_ago,
            " ",
            comments),
        h(CommentsView, { comments: i.comments })));
}
function CommentsView(props) {
    return (h("div", null,
        props.comments && h("p", null),
        props.comments && props.comments.map(comment => h(CommentView, { comment: comment }))));
}
function CommentView(props) {
    const c = props.comment;
    return (h("details", { open: true },
        h("summary", null,
            h(UserNameView, { user: c.user }),
            " ",
            c.time_ago),
        c.content,
        h(CommentsView, { comments: c.comments })));
}
function UserNameView(props) {
    return h("a", { className: 'bold', href: '/user/' + props.user, "data-cmd": true }, props.user);
}
const Y_URL = 'https://news.ycombinator.com/';
function UserView(props) {
    const u = props.user;
    return (h("div", null,
        h("p", null,
            "user ",
            h("span", { className: 'bold large' },
                u.id,
                " "),
            "(",
            u.karma,
            ") created ",
            u.created),
        h("div", null, u.about),
        h("p", null,
            h("a", { href: Y_URL + 'submitted?id=' + u.id }, "submissions"),
            h("span", null, " | "),
            h("a", { href: Y_URL + 'threads?id=' + u.id }, "comments"))));
}
function ErrorView(err) {
    return h("div", null,
        "Error: ",
        err);
}
//export { render, renderToString, createElement, h, Fragment };
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
