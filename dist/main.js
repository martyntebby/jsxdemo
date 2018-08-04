"use strict";
const prepath = document.location.pathname.substring(0, document.location.pathname.lastIndexOf('/'));
main();
function main() {
    doFetch(document.location.pathname);
    document.body.onclick = onClick;
    window.onpopstate = onPopState;
}
function onClick(e) {
    if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
        doFetch(prepath + e.target.pathname, true);
        e.preventDefault();
    }
}
function onPopState(e) {
    doFetch(document.location.pathname);
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
async function doFetch(pathname, updateHistory) {
    console.log('doFetch', pathname);
    const { cmd, arg, url } = link2cmd(pathname);
    const vnode = fetchFormat(url, cmd, arg);
    const elem = document.getElementsByTagName('main')[0];
    elem.firstElementChild.className = 'loading';
    if (updateHistory) {
        window.history.pushState({}, '', pathname);
    }
    render((await vnode), elem);
}
async function fetchFormat(url, cmd, arg) {
    try {
        const resp = await fetch(url);
        if (!resp.ok)
            return ErrorView(resp.statusText);
        const json = await resp.json();
        return json.error ? ErrorView(json.error) :
            cmd === 'user' ? UserView({ user: json }) :
                cmd === 'item' ? ItemView({ item: json }) :
                    ItemsView({ items: json, cmd: cmd, page: Number.parseInt(arg) });
    }
    catch (err) {
        return ErrorView(err.toString());
    }
}
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
    return (h("div", null, props.comments && props.comments.map(comment => h(CommentView, { comment: comment }))));
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
function UserView(props) {
    const u = props.user;
    return (h("table", null,
        h("tbody", null,
            h("tr", null,
                h("td", null, "user:"),
                h("td", null, u.id)),
            h("tr", null,
                h("td", null, "created:"),
                h("td", null, u.created)),
            h("tr", null,
                h("td", null, "karma:"),
                h("td", null, u.karma)),
            h("tr", null,
                h("td", null, "about:"),
                h("td", null, u.about)))));
}
function ErrorView(err) {
    return h("div", null,
        "Error: ",
        err);
}
