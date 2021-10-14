"use strict";
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
define("src/jsxrender", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderToStaticMarkup = exports.Fragment = exports.jsxs = exports.jsx = exports.createElement = exports.h = void 0;
    function h(type, props, ...children) {
        if (typeof type === 'string')
            return doElement(type, props, children);
        if (type === Fragment)
            return doChildren(children);
        const props2 = props || {};
        props2.children = children;
        return type(props2);
    }
    exports.h = h;
    exports.createElement = h;
    function jsx(type, props, key) {
        if (typeof type === 'string')
            return doElement(type, props, [props.children]);
        if (type === Fragment)
            return doChildren([props.children]);
        return type(props);
    }
    exports.jsx = jsx;
    exports.jsxs = jsx;
    function Fragment(props) {
        return doChildren([props.children]);
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
});
define("package", [], {
    "name": "jsxdemo",
    "version": "0.9.9a",
    "description": "Hacker News demo for jsxrender.",
    "homepage": "https://github.com/martyntebby/jsxdemo#readme",
    "main": "public/main.js",
    "repository": {
        "type": "git",
        "url": "https://github.com/martyntebby/jsxdemo.git"
    },
    "config": {
        "baseurl": "https://jsxdemo.westinca.com/public",
        "port": 3000,
        "dolog": false,
        "worker": "service",
        "perftest": 0
    },
    "scripts": {
        "install": "ln -sf node_modules/jsxrender/src .",
        "build": "rm -rf dist public/main.js && tsc -b . --force && node dist/bundle.js",
        "watch": "tsc -b . -w --listEmittedFiles",
        "clean": "rm -rf dist",
        "start": "node .",
        "perf": "node . perftest=10000",
        "deno": "deno run --allow-net --allow-read public/main.js",
        "test": "echo none"
    },
    "author": "Martyn Tebby",
    "license": "ISC",
    "devDependencies": {
        "typescript": "4.4.4",
        "@types/node": "14.17.21",
        "@types/react": "^17.0.29",
        "@types/react-dom": "^17.0.9",
        "jsxrender": "martyntebby/jsxrender"
    },
    "dependencies": {}
});
define("demo/src/model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("demo/src/view", ["require", "exports", "src/jsxrender", "package"], function (require, exports, jsxrender_1, package_json_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderToMarkup = exports.mylog = void 0;
    let logs = [];
    function mylog(...args) {
        console.log(...args);
        if (package_json_1.config.dolog)
            logs.push(Date.now() + '  ' + args.join('  '));
    }
    exports.mylog = mylog;
    function renderToMarkup(cmd, arg, data) {
        const vnode = typeof data === 'string' ? ErrorView(data, arg) :
            cmd === 'user' ? UserView({ user: data }) :
                cmd === 'item' ? ItemView({ item: data }) :
                    cmd === 'search' ? SearchesView({ items: data, cmd: cmd }) :
                        ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
        return (0, jsxrender_1.renderToStaticMarkup)(vnode);
    }
    exports.renderToMarkup = renderToMarkup;
    function SearchesView(props) {
        return ((0, jsxrender_1.h)("ol", { className: 'ol' }, props.items.hits.map(item => (0, jsxrender_1.h)("li", { className: 'li' },
            (0, jsxrender_1.h)(SearchView, { item: item })))));
    }
    function SearchView(props) {
        const i = props.item;
        const idomain = i.url && i.url.split('/', 3)[2];
        const url = '/item/' + i.objectID;
        const iurl = i.url || url;
        const iuser = i.author;
        const icomments_count = i.num_comments;
        const created = i.created_at.substring(0, 10);
        const domain = idomain && (0, jsxrender_1.h)("span", { className: 'smallgrey' },
            "(",
            idomain,
            ")");
        const points = i.points > 0 && (0, jsxrender_1.h)("span", null,
            i.points,
            " points");
        const user = iuser && (0, jsxrender_1.h)("span", null,
            "by ",
            (0, jsxrender_1.h)(UserNameView, { user: iuser }));
        const comments = icomments_count > 0 &&
            (0, jsxrender_1.h)("span", null,
                "| ",
                (0, jsxrender_1.h)(Link, { href: url, cmd: true },
                    icomments_count,
                    " comments"));
        return ((0, jsxrender_1.h)("article", null,
            (0, jsxrender_1.h)(Link, { className: 'mainlink', href: iurl, cmd: !idomain }, i.title),
            " ",
            domain,
            (0, jsxrender_1.h)("div", { className: 'smallgrey' },
                points,
                " ",
                user,
                " ",
                created,
                " ",
                comments)));
    }
    function ItemsView(props) {
        return ((0, jsxrender_1.h)("div", null,
            (0, jsxrender_1.h)("ol", { start: (props.page - 1) * 30 + 1, className: 'ol' }, props.items.map(item => (0, jsxrender_1.h)("li", { className: 'li' },
                (0, jsxrender_1.h)(ItemView, { item: item })))),
            PagerView(props)));
    }
    function ItemView(props) {
        const i = props.item;
        const url = i.domain ? i.url : '/' + i.url.replace('?id=', '/');
        const domain = i.domain && (0, jsxrender_1.h)("span", { className: 'smallgrey' },
            "(",
            i.domain,
            ")");
        const points = i.points > 0 && (0, jsxrender_1.h)("span", null,
            i.points,
            " points");
        const user = i.user && (0, jsxrender_1.h)("span", null,
            "by ",
            (0, jsxrender_1.h)(UserNameView, { user: i.user }));
        const comments = i.comments_count > 0 &&
            (0, jsxrender_1.h)("span", null,
                "| ",
                (0, jsxrender_1.h)(Link, { href: '/item/' + i.id, cmd: true },
                    i.comments_count,
                    " comments"));
        return ((0, jsxrender_1.h)("article", { className: i.comments && 'inset' },
            (0, jsxrender_1.h)(Link, { className: 'mainlink', href: url, cmd: !i.domain }, i.title),
            " ",
            domain,
            (0, jsxrender_1.h)("div", { className: 'smallgrey' },
                points,
                " ",
                user,
                " ",
                i.time_ago,
                " ",
                comments),
            i.content && (0, jsxrender_1.h)("p", null),
            i.content,
            (0, jsxrender_1.h)(CommentsView, { comments: i.comments })));
    }
    function CommentsView(props) {
        return !props.comments ? null : ((0, jsxrender_1.h)("div", null,
            (0, jsxrender_1.h)("p", null),
            props.comments.map(comment => (0, jsxrender_1.h)(CommentView, { comment: comment }))));
    }
    function CommentView(props) {
        const c = props.comment;
        return ((0, jsxrender_1.h)("details", { className: 'details', open: true },
            (0, jsxrender_1.h)("summary", null,
                (0, jsxrender_1.h)(UserNameView, { user: c.user }),
                " ",
                c.time_ago),
            c.content,
            (0, jsxrender_1.h)(CommentsView, { comments: c.comments })));
    }
    function UserNameView(props) {
        return (0, jsxrender_1.h)(Link, { className: 'bold', href: '/user/' + props.user, cmd: true }, props.user);
    }
    const Y_URL = 'https://news.ycombinator.com/';
    function UserView(props) {
        const u = props.user;
        return ((0, jsxrender_1.h)("div", { className: 'inset' },
            (0, jsxrender_1.h)("p", null,
                "user ",
                (0, jsxrender_1.h)("span", { className: 'bold large' },
                    u.id,
                    " "),
                "(",
                u.karma,
                ") created ",
                u.created),
            (0, jsxrender_1.h)("div", null, u.about),
            (0, jsxrender_1.h)("p", null,
                (0, jsxrender_1.h)("a", { href: Y_URL + 'submitted?id=' + u.id }, "submissions"),
                (0, jsxrender_1.h)("span", null, " | "),
                (0, jsxrender_1.h)("a", { href: Y_URL + 'threads?id=' + u.id }, "comments"))));
    }
    let color = 0;
    function PagerView(props) {
        const nolink = props.page > 1 ? undefined : 'nolink';
        const prev = (0, jsxrender_1.h)(Link, { href: `/${props.cmd}/${props.page - 1}`, cmd: true, className: nolink }, "\u2190 prev");
        const next = (0, jsxrender_1.h)(Link, { href: `/${props.cmd}/${props.page + 1}`, cmd: true, prefetch: !package_json_1.config.perftest }, "next \u2192");
        const style = package_json_1.config.perftest ? `color:hsl(${++color},100%,50%)` : 'pointer-events:none';
        const page = (0, jsxrender_1.h)("a", { style: style, "data-cmd": 'perftest' },
            "page ",
            props.page);
        return ((0, jsxrender_1.h)("div", { className: 'pager' },
            prev,
            " ",
            page,
            " ",
            next,
            " ",
            (0, jsxrender_1.h)(LogsView, null)));
    }
    function LogsView() {
        return logs.length === 0 ? null : ((0, jsxrender_1.h)("details", null,
            (0, jsxrender_1.h)("summary", null, "Logs"),
            (0, jsxrender_1.h)("pre", null, logs.join('\n')),
            logs = []));
    }
    function Link(props) {
        const href = (props.cmd ? '/myapi' : '') + props.href;
        const target = props.cmd ? '_self' : undefined;
        const prefetch = props.prefetch ? (0, jsxrender_1.h)("link", { rel: 'prefetch', href: href }) : undefined;
        const a = (0, jsxrender_1.h)("a", { href: href, className: props.className, target: target, "data-cmd": props.cmd }, props.children);
        return props.prefetch ? (0, jsxrender_1.h)("span", null,
            prefetch,
            a) : a;
    }
    function ErrorView(err, summary) {
        const open = !summary;
        summary = summary || 'Error';
        return (0, jsxrender_1.h)("details", { open: open, className: 'error' },
            (0, jsxrender_1.h)("summary", null, summary),
            err);
    }
});
define("demo/src/control", ["require", "exports", "demo/src/view", "demo/src/view", "package", "package"], function (require, exports, view_1, view_2, package_json_2, package_json_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = exports.config = exports.renderToMarkup = exports.mylog = exports.updateConfig = exports.splitIndexMain = exports.setupIndexStrs = exports.request2cmd = exports.cacheFetch = void 0;
    Object.defineProperty(exports, "mylog", { enumerable: true, get: function () { return view_1.mylog; } });
    Object.defineProperty(exports, "renderToMarkup", { enumerable: true, get: function () { return view_1.renderToMarkup; } });
    Object.defineProperty(exports, "config", { enumerable: true, get: function () { return package_json_2.config; } });
    Object.defineProperty(exports, "version", { enumerable: true, get: function () { return package_json_2.version; } });
    const STATIC_TTL = 60 * 60 * 24;
    const DYNAMIC_TTL = 60 * 10;
    ;
    let isServer;
    let indexStrs;
    async function getCache() {
        return 'caches' in globalThis && (caches.default || await caches.open(package_json_3.version));
    }
    async function cacheFetch(request, evt) {
        try {
            return await cacheFetch1(request, evt);
        }
        catch (err) {
            return new Response(err);
        }
    }
    exports.cacheFetch = cacheFetch;
    async function cacheFetch1(request, evt) {
        const reqstr = typeof request === 'string' ? request : request.url;
        const { cmd, arg, req } = request2cmd(request);
        const cache = await getCache();
        const cached = cache && await cache.match(request);
        if (cached) {
            if (!cmd)
                return cached;
            const date = cached.headers.get('Date');
            if (date) {
                const diff = Date.now() - Date.parse(date);
                if (diff < DYNAMIC_TTL * 1000)
                    return cached;
            }
        }
        const ttl = cmd ? DYNAMIC_TTL : STATIC_TTL;
        const init = { cf: { cacheTtl: ttl } };
        const resp2 = await fetch(req || request, init);
        if (!resp2.ok)
            return cached || resp2;
        const resp3 = cmd ? await api2response(resp2, cmd, arg) : resp2;
        if (cache && resp3.ok &&
            (cmd === 'news' || cmd === 'newest' || arg === '1' ||
                (package_json_3.config.worker !== 'cf' ? resp3.type === 'basic'
                    : resp3.url === package_json_3.config.baseurl + '/index.html'))) {
            const p = cache.put(request, resp3.clone());
            evt === null || evt === void 0 ? void 0 : evt.waitUntil(p);
        }
        return resp3;
    }
    async function api2response(resp, cmd, arg) {
        const data = await resp.json();
        let html = (0, view_2.renderToMarkup)(cmd, arg, data);
        if (isServer) {
            const sections = await getIndexStrs();
            if (sections)
                html = sections[0] + cmd + sections[1] + html + sections[3];
        }
        return html2response(html, DYNAMIC_TTL);
    }
    function html2response(html, ttl) {
        const headers = [
            ['Date', new Date().toUTCString()],
            ['Content-Type', 'text/html'],
            ['Content-Length', html.length.toString()],
            ['Cache-Control', 'max-age=' + ttl]
        ];
        return new Response(html, { headers: headers, status: 200, statusText: 'OK' });
    }
    async function getIndexStrs() {
        return indexStrs || await setupIndexStrs();
    }
    async function setupIndexStrs(server) {
        (0, view_2.mylog)('setupIndexStrs', server);
        if (!indexStrs) {
            if (server !== undefined)
                isServer = server;
            const url = (isServer ? package_json_3.config.baseurl : '/public') + '/index.html';
            const resp = await cacheFetch(url);
            if (resp.ok) {
                const index = await resp.text();
                indexStrs = splitIndexMain(index);
                if (!isServer) {
                    const cache = await getCache();
                    const html = indexStrs[0] + 'other' + indexStrs[1] + indexStrs[3];
                    if (cache)
                        cache.put('./', html2response(html, STATIC_TTL));
                }
            }
        }
        return indexStrs;
    }
    exports.setupIndexStrs = setupIndexStrs;
    function splitIndexMain(text) {
        const nav = '<nav id="nav" class="">';
        const pos0 = text.indexOf(nav) + nav.length - 2;
        const main = '<main id="main">';
        const pos1 = text.indexOf(main) + main.length;
        const pos2 = text.indexOf('</main>', pos1);
        return [text.substring(0, pos0), text.substring(pos0, pos1),
            text.substring(pos1, pos2), text.substring(pos2)];
    }
    exports.splitIndexMain = splitIndexMain;
    function request2cmd(request) {
        const path = typeof request === 'string' ? request
            : new URL(request.url).pathname;
        const strs = path.split('/');
        const api = path === '/' || strs[1] === 'myapi';
        const cmd = !api ? '' : strs[2] || 'news';
        const arg = !api ? '' : strs[3] || '1';
        const req = !api ? '' : cmd2url(cmd, arg);
        return { cmd, arg, req };
    }
    exports.request2cmd = request2cmd;
    function cmd2url(cmd, arg) {
        switch (cmd) {
            case 'search': return `https://hn.algolia.com/api/v1/search?query=${arg}&hitsPerPage=50&tags=story`;
            case 'newest': return `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`;
            default: return `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
        }
    }
    function updateConfig(args) {
        args.forEach(arg => {
            const [key, value] = arg.split('=');
            if (key in package_json_3.config)
                package_json_3.config[key] = value !== null && value !== void 0 ? value : true;
        });
    }
    exports.updateConfig = updateConfig;
});
define("demo/src/browser2", ["require", "exports", "demo/src/control"], function (require, exports, control_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fetchPath = exports.clientRequest = exports.enableSW = void 0;
    let sw = false;
    function enableSW() {
        sw = true;
    }
    exports.enableSW = enableSW;
    async function clientRequest(path) {
        path = path || '/myapi/news/1';
        const markupp = fetchPath(path);
        const { cmd } = (0, control_1.request2cmd)(path);
        const nav = document.getElementById('nav');
        const main = document.getElementById('main');
        const child = main.firstElementChild;
        if (child)
            child.className = 'loading';
        main.innerHTML = await markupp;
        nav.className = cmd || 'other';
        window.scroll(0, 0);
    }
    exports.clientRequest = clientRequest;
    async function fetchPath(path) {
        const func = sw ? fetch : control_1.cacheFetch;
        try {
            const resp = await func(path);
            return await resp.text();
        }
        catch (err) {
            return (0, control_1.renderToMarkup)('', '', err + ' Maybe offline?');
        }
    }
    exports.fetchPath = fetchPath;
});
define("demo/src/perftest", ["require", "exports", "demo/src/control", "demo/src/browser2"], function (require, exports, control_2, browser2_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.perftestpost = exports.perftestgui = exports.perftest = void 0;
    let started = 0;
    async function perftest(items) {
        (0, control_2.mylog)('perftest', control_2.config.perftest);
        if (!items) {
            const res = await (0, control_2.cacheFetch)(control_2.config.baseurl + '/static/news.json');
            items = await res.json();
        }
        const start = Date.now();
        for (let i = control_2.config.perftest; i > 0; --i) {
            const str = (0, control_2.renderToMarkup)('news', '1', items);
        }
        return perfstr(start);
    }
    exports.perftest = perftest;
    function perftestgui() {
        (0, control_2.mylog)('perftestgui', control_2.config.perftest);
        if (control_2.config.perftest > 0) {
            perftestasync();
            return;
        }
        if (started) {
            (0, control_2.mylog)('stop');
            started = 0;
            return;
        }
        started = Date.now();
        window.postMessage(-control_2.config.perftest, '*');
    }
    exports.perftestgui = perftestgui;
    async function perftestasync() {
        const main = document.getElementById('main');
        main.innerHTML = 'perftest ' + control_2.config.perftest + ' ...';
        main.innerHTML = await perftest();
    }
    async function perftestpost(count) {
        if (!started)
            return;
        const main = document.getElementById('main');
        if (count > 0) {
            main.innerHTML = await (0, browser2_1.fetchPath)('/myapi/ask/2');
            window.postMessage(count - 1, '*');
        }
        else {
            main.innerHTML = perfstr(started);
            started = 0;
        }
    }
    exports.perftestpost = perftestpost;
    function perfstr(start) {
        const duration = (Date.now() - start) / 1000;
        const iterations = Math.abs(control_2.config.perftest);
        const ips = (iterations / duration).toFixed();
        const str = 'iterations: ' + iterations + ' duration: ' + duration + ' fps: ' + ips;
        (0, control_2.mylog)(str);
        return str;
    }
});
define("demo/src/onevents", ["require", "exports", "demo/src/browser2", "demo/src/perftest"], function (require, exports, browser2_2, perftest_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setupHandlers = void 0;
    function setupHandlers() {
        window.onmessage = onMessage;
        window.onpopstate = onPopState;
        document.body.onclick = onClick;
        document.body.onsubmit = onSubmit;
    }
    exports.setupHandlers = setupHandlers;
    function onPopState(e) {
        (0, browser2_2.clientRequest)(e.state);
    }
    function onClick(e) {
        if (e.target instanceof HTMLAnchorElement) {
            const cmd = e.target.dataset.cmd;
            if (cmd !== undefined) {
                e.preventDefault();
                if (cmd === 'perftest')
                    return (0, perftest_1.perftestgui)();
                const path = cmd || e.target.pathname;
                window.history.pushState(path, '');
                (0, browser2_2.clientRequest)(path);
            }
        }
    }
    function onSubmit(e) {
        if (e.target instanceof HTMLFormElement) {
            const cmd = e.target.dataset.cmd;
            if (cmd !== undefined) {
                e.preventDefault();
                const path = '/myapi/search/' + e.target.query.value;
                window.history.pushState(path, '');
                (0, browser2_2.clientRequest)(path);
            }
        }
    }
    async function onMessage(e) {
        (0, perftest_1.perftestpost)(e.data);
    }
});
define("demo/src/browser", ["require", "exports", "demo/src/control", "demo/src/browser2", "demo/src/onevents"], function (require, exports, control_3, browser2_3, onevents_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.browser = void 0;
    async function browser() {
        (0, control_3.mylog)('browser');
        if (!('fetch' in window)) {
            swfail('Browser not supported.', 'Missing fetch.');
            return;
        }
        const query = window.location.search;
        if (query)
            (0, control_3.updateConfig)(query.substring(1).split('&'));
        const main = document.getElementById('main');
        if (!main.firstElementChild)
            (0, browser2_3.clientRequest)();
        (0, onevents_1.setupHandlers)();
        startWorker();
    }
    exports.browser = browser;
    function startWorker() {
        if (control_3.config.worker === 'service' && !control_3.config.perftest) {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js')
                    .then(reg => { (0, browser2_3.enableSW)(); (0, control_3.mylog)(reg); }, err => swfail('ServiceWorker failed.', err));
            }
            else {
                swfail('ServiceWorker unsupported.', '');
            }
        }
    }
    function swfail(summary, reason) {
        (0, control_3.mylog)('sw failed:', summary, reason);
        const error = document.getElementById('error');
        error.outerHTML = (0, control_3.renderToMarkup)('', summary, reason +
            '<br><br>Ensure cookies are enabled, the connection is secure,' +
            ' the browser is not in private mode and is supported' +
            ' (Chrome on Android, Safari on iOS).');
    }
});
define("demo/src/nodejs", ["require", "exports", "fs", "http", "https", "demo/src/control", "demo/src/perftest"], function (require, exports, fs, http, https, control_4, perftest_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodejs = void 0;
    let indexStrs;
    function nodejs() {
        (0, control_4.mylog)('nodejs');
        (0, control_4.updateConfig)(process.argv.slice(2));
        control_4.config.worker = 'node';
        if (control_4.config.perftest)
            doPerfTest();
        else
            doServer();
    }
    exports.nodejs = nodejs;
    function doPerfTest() {
        const news = fs.readFileSync('public/static/news.json', 'utf8');
        const json = JSON.parse(news);
        (0, perftest_2.perftest)(json);
        process.exit();
    }
    function doServer() {
        const indexStr = fs.readFileSync('public/index.html', 'utf8');
        indexStrs = (0, control_4.splitIndexMain)(indexStr);
        const server = http.createServer(serverRequest).listen(control_4.config.port);
        (0, control_4.mylog)('listening', server.address());
    }
    function serverRequest(req, res) {
        let url = req.url;
        (0, control_4.mylog)('serverRequest', url);
        if (!url)
            return;
        const pos = url.indexOf('?');
        if (pos > 0)
            url = url.substring(0, pos);
        if (url === '/') {
            res.statusCode = 301;
            res.setHeader('Location', '/public/');
            res.end();
            return;
        }
        if (url === '/public/')
            url = '/public/index.html';
        if (url.startsWith('/public/')) {
            fs.readFile('.' + url, null, (err, data) => {
                if (err)
                    (0, control_4.mylog)(err.message);
                res.statusCode = 200;
                res.setHeader('Date', new Date().toUTCString());
                res.setHeader('Cache-Control', 'max-age=3600');
                if (url === null || url === void 0 ? void 0 : url.endsWith('.js'))
                    res.setHeader('Content-Type', 'application/javascript');
                res.end(data);
            });
            return;
        }
        if (url.startsWith('/myapi/')) {
            serveNews(url, res);
        }
        else {
            (0, control_4.mylog)('unhandled url:', url);
            res.statusCode = 404;
            res.end();
        }
    }
    function serveNews(path, res) {
        const { cmd, arg, req } = (0, control_4.request2cmd)(path);
        res.statusCode = 200;
        res.setHeader('Date', new Date().toUTCString());
        res.setHeader('Cache-Control', 'max-age=600');
        res.setHeader('Content-Type', 'text/html');
        res.write(indexStrs[0] + cmd + indexStrs[1]);
        function sendResp(data) {
            res.write((0, control_4.renderToMarkup)(cmd, arg, data));
            res.end(indexStrs[3]);
        }
        fetchJson(req, sendResp);
    }
    function fetchJson(url, sendResp) {
        (0, control_4.mylog)('fetchJson', url);
        https.get(url, clientRequest)
            .on('error', err => sendResp(err.message));
        function clientRequest(res2) {
            if (res2.statusCode !== 200) {
                res2.resume();
                sendResp(res2.statusCode + ': ' + res2.statusMessage);
            }
            else {
                let data = '';
                res2.on('data', chunk => data += chunk);
                res2.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        data = !json ? 'No data' : json.error ? json.error.toString() : json;
                    }
                    catch (err) {
                        data = '' + err;
                    }
                    sendResp(data);
                });
            }
        }
    }
});
define("demo/src2/denojs", ["require", "exports", "demo/src/control"], function (require, exports, control_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.denojs = void 0;
    function denojs() {
        (0, control_5.mylog)('*********************** Incorrect. Do not use. *************************');
        (0, control_5.mylog)('denojs');
        (0, control_5.updateConfig)(Deno.args);
        control_5.config.worker = 'deno';
        doListener(control_5.config.port);
        (0, control_5.setupIndexStrs)(true);
    }
    exports.denojs = denojs;
    async function doListener(port) {
        var e_1, _a;
        const listener = Deno.listen({ port });
        (0, control_5.mylog)('listening', listener.addr);
        try {
            for (var listener_1 = __asyncValues(listener), listener_1_1; listener_1_1 = await listener_1.next(), !listener_1_1.done;) {
                const conn = listener_1_1.value;
                doConn(conn);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (listener_1_1 && !listener_1_1.done && (_a = listener_1.return)) await _a.call(listener_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    async function doConn(conn) {
        const buf = new Uint8Array(4096);
        await conn.read(buf);
        const str = new TextDecoder().decode(buf);
        (0, control_5.mylog)('doConn', str.substring(0, 20));
        if (str.startsWith('GET ')) {
            const pos = str.indexOf(' ', 4);
            const path = str.substring(4, pos);
            await doGet(path, conn);
        }
        conn.close();
    }
    async function doGet(path, conn) {
        (0, control_5.mylog)('doGet', path);
        const pos = path.indexOf('?');
        if (pos > 0)
            path = path.substring(0, pos);
        if (path === '/') {
            const status = 301;
            const headers = [['Location', '/public/']];
            const res = new Response(null, { headers, status });
            await writeResponse(res, conn);
        }
        else if (path.startsWith('/public/')) {
            await doFile('.' + path, conn);
        }
        else if (path.startsWith('/myapi/')) {
            await doApi(path, conn);
        }
    }
    async function doFile(path, conn) {
        let type = 'text/html';
        if (path === './public/')
            path = './public/index.html';
        if (path.endsWith('.js'))
            type = 'application/javascript';
        if (path.endsWith('.json'))
            type = 'application/json';
        if (path.endsWith('.png'))
            type = 'image/png';
        const stat = await Deno.stat(path);
        const ok = stat.isFile;
        const status = ok ? 200 : 404;
        const statusText = ok ? 'OK' : 'File Not Found';
        const headers = [
            ['Date', new Date().toUTCString()],
            ['Content-Type', type],
            ['Content-Length', stat.size.toString()],
            ['Cache-Control', 'max-age=3600']
        ];
        const res = new Response(null, { headers, status, statusText });
        await writeResponse(res, conn);
        if (ok) {
            const file = await Deno.open(path);
            await Deno.copy(file, conn);
            file.close();
        }
    }
    async function doApi(path, conn) {
        const res = await (0, control_5.cacheFetch)(path);
        await writeResponse(res, conn);
    }
    async function writeResponse(res, conn) {
        const encoder = new TextEncoder();
        conn.write(encoder.encode(`HTTP/1.0 ${res.status} ${res.statusText}\r\n`));
        res.headers.forEach((value, key, parent) => {
            const str = key + ': ' + value + '\r\n';
            conn.write(encoder.encode(str));
        });
        conn.write(encoder.encode('\r\n'));
        const body = new Uint8Array(await res.arrayBuffer());
        await conn.write(body);
    }
});
define("demo/src/worker", ["require", "exports", "demo/src/control"], function (require, exports, control_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sworker = exports.cfworker = exports.worker = void 0;
    const PRE_CACHE = ['index.html',
        'main.js',
        'static/app.css',
        'static/intro.html',
        'static/manifest.json',
        'static/favicon-32.png',
        'static/favicon-256.png'
    ];
    ;
    function sworker() {
        (0, control_6.mylog)('sworker');
        self.addEventListener('install', onInstall);
        self.addEventListener('activate', onActivate);
        self.addEventListener('fetch', onFetch);
    }
    exports.sworker = sworker;
    function cfworker() {
        (0, control_6.mylog)('cfworker');
        self.addEventListener('fetch', onFetch);
        cfUpdateConfig();
        (0, control_6.setupIndexStrs)(true);
    }
    exports.cfworker = cfworker;
    function worker() {
        (0, control_6.mylog)('worker');
        self.addEventListener('message', onMessage);
        (0, control_6.setupIndexStrs)(false);
    }
    exports.worker = worker;
    function onInstall(e) {
        (0, control_6.mylog)('onInstall', e);
        (0, control_6.mylog)('precache', PRE_CACHE);
        e.waitUntil(caches.open(control_6.version).then(cache => cache.addAll(PRE_CACHE)).then(() => (0, control_6.setupIndexStrs)(false).then(() => self.skipWaiting())));
    }
    function onActivate(e) {
        (0, control_6.mylog)('onActivate', e);
        e.waitUntil(self.clients.claim().then(() => caches.keys().then(keys => Promise.all(keys.filter(key => key !== control_6.version).map(name => caches.delete(name))))));
    }
    function onFetch(e) {
        e.respondWith((0, control_6.cacheFetch)(e.request, e));
    }
    function onMessage(e) {
        (0, control_6.cacheFetch)(e.data)
            .then(res => res.text()
            .then(text => self.postMessage(text)));
    }
    function cfUpdateConfig() {
        Object.keys(control_6.config).forEach(key => {
            const value = self[key.toUpperCase()];
            if (value != null)
                control_6.config[key] = value;
        });
        control_6.config.worker = 'cf';
    }
});
define("demo/src/main", ["require", "exports", "demo/src/control", "demo/src/nodejs", "demo/src2/denojs", "demo/src/browser", "demo/src/worker"], function (require, exports, control_7, nodejs_1, denojs_1, browser_1, worker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    main();
    function main() {
        (0, control_7.mylog)('main', control_7.version);
        if ('Deno' in globalThis)
            (0, denojs_1.denojs)();
        else if ('window' in globalThis)
            (0, browser_1.browser)();
        else if (typeof process === 'object' && process.version)
            (0, nodejs_1.nodejs)();
        else if ('clients' in globalThis && 'skipWaiting' in globalThis)
            (0, worker_1.sworker)();
        else if ('caches' in globalThis && 'default' in globalThis.caches)
            (0, worker_1.cfworker)();
        else if ('importScripts' in globalThis)
            (0, worker_1.worker)();
        else {
            console.error('unknown environment', globalThis);
            throw 'unknown environment ' + globalThis;
        }
        (0, control_7.mylog)('config:', JSON.stringify(control_7.config));
    }
});
function define(name, params, func) {
    name = fixModuleName(name);
    const _self = globalThis;
    _self.myexports = _self.myexports || {};
    if (typeof func !== 'function') {
        _self.myexports[name] = func;
        return;
    }
    const req = typeof require === 'undefined' ? undefined : require;
    const args = [req, _self.myexports[name] = {}];
    for (let i = 2; i < params.length; ++i) {
        const name2 = fixModuleName(params[i]);
        args[i] = _self.myexports[name2] || (req && req(name2));
    }
    func.apply(null, args);
}
function fixModuleName(name) {
    return name.startsWith('react/jsx-') ? 'src/jsxrender' : name;
}
