"use strict";
define("src/jsxrender", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function h(type, props, ...children) {
        if (typeof type === 'string') {
            return doElement(type, props, children);
        }
        if (type === Fragment) { // minor optimization
            return doChildren(children);
        }
        props = props || {};
        props.children = children;
        return type(props);
    }
    exports.h = h;
    exports.createElement = h;
    function Fragment(props) {
        return doChildren(props.children);
    }
    exports.Fragment = Fragment;
    function renderToStaticMarkup(element) {
        return element;
    }
    exports.renderToStaticMarkup = renderToStaticMarkup;
    function doElement(type, props, children) {
        let str = '<' + type;
        for (const name in props)
            str += doProp(name, props[name]);
        return str + '>' + doChildren(children) + '</' + type + '>';
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
    function doStyle(style) {
        return Object.keys(style).map(key => {
            const key2 = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${key2}:${style[key]}`;
        }).join(';');
    }
});
define("demo/src/model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("demo/src/view", ["require", "exports", "src/jsxrender"], function (require, exports, jsxrender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let logs = [];
    function mylog(...args) {
        console.log(...args);
        //  logs.push(Date.now() + '  ' + args.join('  '));
    }
    exports.mylog = mylog;
    function renderToMarkup(cmd, arg, data) {
        mylog('renderToMarkup', cmd, arg);
        const vnode = typeof data === 'string' ? ErrorView(data) :
            cmd === 'user' ? UserView({ user: data }) :
                cmd === 'item' ? ItemView({ item: data }) :
                    ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
        return jsxrender_1.renderToStaticMarkup(vnode);
    }
    exports.renderToMarkup = renderToMarkup;
    function ItemsView(props) {
        return (jsxrender_1.h("div", null,
            jsxrender_1.h(LogsView, null),
            jsxrender_1.h("ol", { start: (props.page - 1) * 30 + 1, className: 'ol' }, props.items.map(item => jsxrender_1.h("li", { className: 'li' },
                jsxrender_1.h(ItemView, { item: item })))),
            PagerView(props)));
    }
    function ItemView(props) {
        const i = props.item;
        const url = i.domain ? i.url : '/' + i.url.replace('?id=', '/');
        const domain = i.domain && jsxrender_1.h("span", { className: 'smallgrey' },
            "(",
            i.domain,
            ")");
        const points = i.points > 0 && jsxrender_1.h("span", null,
            i.points,
            " points");
        const user = i.user && jsxrender_1.h("span", null,
            "by ",
            jsxrender_1.h(UserNameView, { user: i.user }));
        const comments = i.comments_count > 0 &&
            jsxrender_1.h("span", null,
                "| ",
                jsxrender_1.h("a", { href: '/item/' + i.id, "data-cmd": true },
                    i.comments_count,
                    " comments"));
        return (jsxrender_1.h("article", { className: i.comments && 'inset' },
            jsxrender_1.h("a", { className: 'mainlink', href: url, "data-cmd": !i.domain }, i.title),
            " ",
            domain,
            jsxrender_1.h("div", { className: 'smallgrey' },
                points,
                " ",
                user,
                " ",
                i.time_ago,
                " ",
                comments),
            i.content && jsxrender_1.h("p", null),
            i.content,
            jsxrender_1.h(CommentsView, { comments: i.comments })));
    }
    function CommentsView(props) {
        return !props.comments ? null : (jsxrender_1.h("div", null,
            jsxrender_1.h("p", null),
            props.comments.map(comment => jsxrender_1.h(CommentView, { comment: comment }))));
    }
    function CommentView(props) {
        const c = props.comment;
        return (jsxrender_1.h("details", { className: 'details', open: true },
            jsxrender_1.h("summary", null,
                jsxrender_1.h(UserNameView, { user: c.user }),
                " ",
                c.time_ago),
            c.content,
            jsxrender_1.h(CommentsView, { comments: c.comments })));
    }
    function UserNameView(props) {
        return jsxrender_1.h("a", { className: 'bold', href: '/user/' + props.user, "data-cmd": true }, props.user);
    }
    const Y_URL = 'https://news.ycombinator.com/';
    function UserView(props) {
        const u = props.user;
        return (jsxrender_1.h("div", { className: 'inset' },
            jsxrender_1.h("p", null,
                "user ",
                jsxrender_1.h("span", { className: 'bold large' },
                    u.id,
                    " "),
                "(",
                u.karma,
                ") created ",
                u.created),
            jsxrender_1.h("div", null, u.about),
            jsxrender_1.h("p", null,
                jsxrender_1.h("a", { href: Y_URL + 'submitted?id=' + u.id }, "submissions"),
                jsxrender_1.h("span", null, " | "),
                jsxrender_1.h("a", { href: Y_URL + 'threads?id=' + u.id }, "comments"))));
    }
    function LogsView() {
        return logs.length === 0 ? null : (jsxrender_1.h("details", { open: true },
            jsxrender_1.h("summary", null, "Logs"),
            jsxrender_1.h("pre", null, logs.join('\n')),
            logs = []));
    }
    function PagerView(props) {
        const nolink = props.page > 1 ? undefined : 'nolink';
        const prev = jsxrender_1.h("a", { href: `/${props.cmd}/${props.page - 1}`, "data-cmd": true, className: nolink }, "\u2190 prev");
        const next = jsxrender_1.h("a", { href: `/${props.cmd}/${props.page + 1}`, "data-cmd": true }, "next \u2192");
        return (jsxrender_1.h("div", { className: 'pager' },
            prev,
            " ",
            jsxrender_1.h("span", null,
                "page ",
                props.page),
            " ",
            next));
    }
    function ErrorView(err) {
        return jsxrender_1.h("div", { className: 'error' },
            "Error: ",
            err);
    }
});
define("demo/src/control", ["require", "exports", "demo/src/view", "demo/src/view"], function (require, exports, view_1, view_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderToMarkup = view_1.renderToMarkup;
    const myapi = '/myapi/';
    exports.myapi = myapi;
    async function fetchMarkup(path, useapi) {
        view_2.mylog('fetchMarkup', path, useapi);
        const { cmd, arg, url } = link2cmd(path, useapi);
        const data = await fetchData(url, !useapi);
        const html = useapi ? data : view_2.renderToMarkup(cmd, arg, data);
        return { html, cmd, arg };
    }
    exports.fetchMarkup = fetchMarkup;
    function link2cmd(path, useapi) {
        path = path || '';
        const strs = path.split('/');
        const cmd = strs[1] || 'news';
        const arg = strs[2] || '1';
        const url = cmd2url(cmd, arg, useapi);
        return { cmd, arg, url };
    }
    exports.link2cmd = link2cmd;
    async function fetchData(url, json) {
        view_2.mylog('fetchData', url);
        try {
            const resp = await fetch(url);
            if (!resp.ok)
                return resp.statusText;
            const datap = json ? resp.json() : resp.text();
            const data = await datap;
            return !data ? 'No data' : data.error ? data.error.toString() : data;
        }
        catch (err) {
            return err.toString();
        }
    }
    function cmd2url(cmd, arg, useapi) {
        return useapi ? `${myapi}${cmd}/${arg}`
            : cmd === 'newest'
                ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
                : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
    }
});
define("demo/sw/sw", ["require", "exports", "demo/src/control"], function (require, exports, control_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const CACHE_NAME = '0.9.2';
    const PRE_CACHE = ['./',
        'manifest.json',
        'assets/favicon-32.png',
        'assets/favicon-256.png'
    ];
    sw();
    function sw() {
        console.log('sw', CACHE_NAME);
        self.addEventListener('install', onInstall);
        self.addEventListener('activate', onActivate);
        self.addEventListener('fetch', onFetch);
    }
    function onInstall(e) {
        console.log('onInstall', e);
        console.log('precache', PRE_CACHE);
        e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRE_CACHE))
            .then(() => self.skipWaiting()));
    }
    function onActivate(e) {
        console.log('onActivate', e);
        e.waitUntil(self.clients.claim()
            .then(() => caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(name => caches.delete(name))))));
    }
    function onFetch(e) {
        e.respondWith(cacheFetch(e.request));
    }
    async function cacheFetch(request) {
        console.log('cacheFetch', request.url);
        const pos = request.url.indexOf(control_1.myapi);
        if (pos >= 0) {
            const { html } = await control_1.fetchMarkup(request.url.substring(pos + 1));
            return new Response(html);
        }
        if (request.mode === 'navigate')
            request = new Request('./');
        const cache = await caches.open(CACHE_NAME);
        let response = await cache.match(request);
        if (!response) {
            response = await fetch(request);
            if (response && response.ok && response.type === 'basic') {
                console.log('cache', response);
                cache.put(request, response.clone());
            }
        }
        else {
            console.log('from cache', response.url);
        }
        return response;
    }
});
// hacked fake requirejs - use AMD modules with single output file
function define(name, params, func) {
    // @ts-ignore: Window | Global not assignable to MySelf
    const _self = typeof self === 'object' ? self : global;
    _self.myexports = _self.myexports || {};
    const req = typeof require === 'undefined' ? undefined : require;
    const args = [req, _self.myexports[name] = {}];
    for (let i = 2; i < params.length; ++i) {
        args[i] = _self.myexports[params[i]] || (req && req(params[i]));
    }
    func.apply(null, args);
}
