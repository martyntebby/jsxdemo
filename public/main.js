"use strict";
define("package", [], {
    "name": "jsxdemo",
    "version": "0.9.9b",
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
        "tests": 0
    },
    "scripts": {
        "install": "ln -sf node_modules/jsxrender/src .",
        "build": "rm -rf dist public/main.js && tsc -b . --force && node dist/bundle.js",
        "watch": "tsc -b . -w --listEmittedFiles",
        "clean": "rm -rf dist",
        "start": "node .",
        "test": "node . tests=1",
        "perf": "node . tests=10000",
        "deno": "deno run --allow-net --allow-read public/main.js"
    },
    "author": "Martyn Tebby",
    "license": "ISC",
    "devDependencies": {
        "typescript": "4.4.4",
        "@types/node": "16.11.6",
        "@types/react": "^17.0.33",
        "@types/react-dom": "^17.0.10",
        "jsxrender": "martyntebby/jsxrender"
    },
    "dependencies": {}
});
define("demo/src/misc", ["require", "exports", "package", "package"], function (require, exports, package_json_1, package_json_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = exports.config = exports.updateConfig = exports.resetLog = exports.mylog = void 0;
    Object.defineProperty(exports, "config", { enumerable: true, get: function () { return package_json_1.config; } });
    Object.defineProperty(exports, "version", { enumerable: true, get: function () { return package_json_1.version; } });
    ;
    let logs = [];
    function mylog(...args) {
        console.log(...args);
        if (package_json_2.config.dolog)
            logs.push(Date.now() + '  ' + args.join('  '));
    }
    exports.mylog = mylog;
    function resetLog() {
        const l = logs;
        logs = [];
        return l;
    }
    exports.resetLog = resetLog;
    function updateConfig(args) {
        args.forEach(arg => {
            const [key, value] = arg.split('=');
            if (key in package_json_2.config)
                package_json_2.config[key] = value ?? true;
        });
    }
    exports.updateConfig = updateConfig;
});
define("demo/src/indexes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setIndexHtml = exports.getIndexHtml = exports.getIndexes = void 0;
    let indexes;
    function getIndexes() {
        return indexes;
    }
    exports.getIndexes = getIndexes;
    function getIndexHtml() {
        return indexes[0] + indexes[1] + indexes[2];
    }
    exports.getIndexHtml = getIndexHtml;
    function setIndexHtml(text) {
        indexes = splitIndexMain(text);
    }
    exports.setIndexHtml = setIndexHtml;
    function splitIndexMain(text) {
        if (!text)
            return;
        const nav = '<nav id="nav" class="">';
        const pos0 = text.indexOf(nav) + nav.length - 2;
        const main = '<main id="main">';
        const pos1 = text.indexOf(main) + main.length;
        const pos2 = text.indexOf('</main>', pos1);
        return [text.substring(0, pos0), text.substring(pos0, pos1),
            text.substring(pos2)];
    }
});
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
define("demo/src/model", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("demo/src/view", ["require", "exports", "demo/src/indexes", "demo/src/misc", "src/jsxrender"], function (require, exports, indexes_1, misc_1, jsxrender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderToMarkup = void 0;
    function renderToMarkup(data, cmd, arg) {
        const vnode = renderToJSX(data, cmd, arg);
        const str = (0, jsxrender_1.renderToStaticMarkup)(vnode);
        const indexes = (0, indexes_1.getIndexes)();
        return indexes ? indexes[0] + cmd + indexes[1] + str + indexes[2] : str;
    }
    exports.renderToMarkup = renderToMarkup;
    function renderToJSX(data, cmd, arg) {
        switch (cmd) {
            case '':
            case 'error': return MsgView(data, arg, cmd);
            case 'user': return UserView({ user: data });
            case 'item': return ItemView({ item: data });
            case 'search': return SearchesView({ res: data });
        }
        return ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
    }
    function SearchesView(props) {
        const props2 = {
            items: props.res.hits,
            cmd: 'search',
            page: props.res.page + 1,
            pageSize: props.res.hitsPerPage,
            query: props.res.query,
        };
        return ItemsView(props2);
    }
    function ItemsView(props) {
        const size = props.pageSize || 30;
        return ((0, jsxrender_1.h)("div", null,
            (0, jsxrender_1.h)("ol", { start: (props.page - 1) * size + 1, className: 'ol' }, props.items.map(item => (0, jsxrender_1.h)("li", { className: 'li' },
                (0, jsxrender_1.h)(ItemView, { item: item })))),
            props.cmd !== 'search' && PagerView(props)));
    }
    function ItemView(props) {
        const i = props.item;
        const url = '/item/' + (i.id || i.objectID);
        const iurl = !i.url || i.url.startsWith('item?id=') ? url : i.url;
        const iuser = i.user || i.author;
        const icount = i.comments_count || i.num_comments;
        const idomain = i.domain || i.url?.split('/', 3)[2];
        const idate = i.time_ago || i.created_at?.substring(0, 10);
        const domain = idomain && (0, jsxrender_1.h)("span", { className: 'smallgrey' },
            "(",
            idomain,
            ")");
        const points = !!i.points && (0, jsxrender_1.h)("span", null,
            i.points,
            " points");
        const user = iuser && (0, jsxrender_1.h)("span", null,
            "by ",
            (0, jsxrender_1.h)(UserNameView, { user: iuser }));
        const comments = !!icount &&
            (0, jsxrender_1.h)("span", null,
                "| ",
                (0, jsxrender_1.h)(Link, { href: url, cmd: true },
                    icount,
                    " comments"));
        return ((0, jsxrender_1.h)("article", { className: i.comments && 'inset' },
            (0, jsxrender_1.h)(Link, { className: 'mainlink', href: iurl, cmd: !idomain }, i.title),
            " ",
            domain,
            (0, jsxrender_1.h)("div", { className: 'smallgrey optional' },
                points,
                " ",
                user,
                " ",
                idate,
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
        const next = (0, jsxrender_1.h)(Link, { href: `/${props.cmd}/${props.page + 1}`, cmd: true, prefetch: !misc_1.config.tests }, "next \u2192");
        const style = misc_1.config.tests ? `color:hsl(${++color},100%,50%)` : 'pointer-events:none';
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
        const logs = (0, misc_1.resetLog)();
        return logs.length === 0 ? null : ((0, jsxrender_1.h)("details", null,
            (0, jsxrender_1.h)("summary", null, "Logs"),
            (0, jsxrender_1.h)("pre", null, logs.join('\n'))));
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
    function MsgView(details, summary, className) {
        return ((0, jsxrender_1.h)("details", { open: !summary, className: className },
            (0, jsxrender_1.h)("summary", null, summary || 'Error'),
            details));
    }
});
define("demo/src/control", ["require", "exports", "demo/src/indexes", "demo/src/misc", "demo/src/view"], function (require, exports, indexes_2, misc_2, view_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.path2cmd = exports.cacheFetch = exports.cacheRoot = exports.setupIndex = exports.enableCache = void 0;
    const STATIC_TTL = 60 * 60 * 24;
    const DYNAMIC_TTL = 60 * 10;
    let useCache = false;
    function enableCache() {
        useCache = true;
    }
    exports.enableCache = enableCache;
    async function getCache() {
        return useCache && (caches.default || await caches.open(misc_2.version));
    }
    async function setupIndex() {
        (0, misc_2.mylog)('setupIndex');
        const url = misc_2.config.baseurl + '/index.html';
        const resp = await cacheFetch(url);
        if (resp.ok) {
            const index = await resp.text();
            (0, indexes_2.setIndexHtml)(index);
        }
        return resp.ok;
    }
    exports.setupIndex = setupIndex;
    async function cacheRoot() {
        if (await setupIndex()) {
            (0, misc_2.mylog)('cacheRoot');
            const html = (0, indexes_2.getIndexHtml)();
            (0, indexes_2.setIndexHtml)('');
            const cache = await getCache();
            if (cache)
                cache.put('./', html2response(html, STATIC_TTL));
        }
    }
    exports.cacheRoot = cacheRoot;
    async function cacheFetch(request, evt) {
        try {
            return await cacheFetch1(request, evt);
        }
        catch (err) {
            (0, misc_2.mylog)('Error', err);
            return new Response(err);
        }
    }
    exports.cacheFetch = cacheFetch;
    async function cacheFetch1(request, evt) {
        const { cmd, arg, url } = path2cmd(request);
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
        const resp2 = await fetch(url || request, init);
        if (!resp2.ok)
            return cached || resp2;
        const resp3 = cmd ? await api2response(resp2, cmd, arg) : resp2;
        if (cache && resp3.ok &&
            (cmd === 'news' || cmd === 'newest' || arg === '1' ||
                (misc_2.config.worker !== 'cf' ? resp3.type === 'basic'
                    : resp3.url === misc_2.config.baseurl + '/index.html'))) {
            const p = cache.put(request, resp3.clone());
            evt?.waitUntil(p);
        }
        return resp3;
    }
    async function api2response(resp, cmd, arg) {
        const data = await resp.json();
        const html = (0, view_1.renderToMarkup)(data, cmd, arg);
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
    function path2cmd(request, log) {
        let path;
        if (typeof request === 'string') {
            path = request;
        }
        else {
            const url = new URL(request.url);
            path = url.pathname + url.search;
        }
        const re = /\/|\?/;
        const strs = path.split(re);
        const api = path === '/' || strs[1] === 'myapi';
        const cmd = !api ? '' : strs[2] || 'news';
        const arg = !api ? '' : strs[3] || '1';
        const url = !api ? '' : cmd2url(cmd, arg);
        const ret = { cmd, arg, url };
        if (log)
            (0, misc_2.mylog)('path2cmd', path, ret);
        return ret;
    }
    exports.path2cmd = path2cmd;
    function cmd2url(cmd, arg) {
        switch (cmd) {
            case 'search': return `https://hn.algolia.com/api/v1/search_by_date?${arg}&hitsPerPage=50&tags=story`;
            case 'newest': return `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`;
            default: return `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
        }
    }
});
define("demo/src/browser2", ["require", "exports", "demo/src/view", "demo/src/control", "demo/src/misc"], function (require, exports, view_2, control_1, misc_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clientRequest = exports.setDirect = void 0;
    let direct = false;
    function setDirect() {
        direct = true;
    }
    exports.setDirect = setDirect;
    async function clientRequest(path) {
        path = path || '/myapi/news/1';
        const markupp = fetchPath(path);
        const { cmd } = (0, control_1.path2cmd)(path);
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
        const func = direct ? fetch : control_1.cacheFetch;
        try {
            const resp = await func(path);
            return await resp.text();
        }
        catch (err) {
            (0, misc_3.mylog)('Error', err);
            const details = err + ' Maybe offline?';
            return (0, view_2.renderToMarkup)(details, 'error', '');
        }
    }
});
define("demo/src/tests", ["require", "exports", "demo/src/misc", "demo/src/control", "demo/src/view"], function (require, exports, misc_4, control_2, view_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.perftestpost = exports.perftestgui = exports.perftest = exports.tests = void 0;
    let started = 0;
    function tests() {
        (0, misc_4.mylog)('tests');
        (0, misc_4.mylog)('config', JSON.stringify(misc_4.config));
        pathtest(false);
        (0, misc_4.mylog)('finished');
    }
    exports.tests = tests;
    function myassert(test, ...args) {
        console.assert(test, ...args);
    }
    function pathtest(log = true) {
        (0, misc_4.mylog)('pathtest');
        const empty = (0, control_2.path2cmd)('', log);
        const myapi = (0, control_2.path2cmd)('/myapi', log);
        const search = (0, control_2.path2cmd)('/myapi/search?query=abc&page=3', log);
        myassert('' === empty.cmd);
        myassert('' === empty.arg);
        myassert('' === empty.url);
        myassert('news' === myapi.cmd);
        myassert('1' === myapi.arg);
        myassert(!!myapi.url);
        myassert('search' === search.cmd);
    }
    async function perftest(items) {
        (0, misc_4.mylog)('perftest', misc_4.config.tests);
        if (!items) {
            const res = await (0, control_2.cacheFetch)(misc_4.config.baseurl + '/static/news.json');
            items = await res.json();
        }
        const start = Date.now();
        for (let i = misc_4.config.tests; i > 0; --i) {
            const str = (0, view_3.renderToMarkup)(items, 'news', '1');
        }
        return perfstr(start);
    }
    exports.perftest = perftest;
    function perftestgui() {
        (0, misc_4.mylog)('perftestgui', misc_4.config.tests);
        if (misc_4.config.tests > 0) {
            perftestasync();
            return;
        }
        if (started) {
            (0, misc_4.mylog)('stop');
            started = 0;
            return;
        }
        started = Date.now();
        perftestpost(-misc_4.config.tests);
    }
    exports.perftestgui = perftestgui;
    async function perftestasync() {
        const main = document.getElementById('main');
        main.innerHTML = 'perftest ' + misc_4.config.tests + ' ...';
        main.innerHTML = await perftest();
    }
    async function perftestpost(count) {
        if (!started)
            return;
        const main = document.getElementById('main');
        if (count > 0) {
            const resp = await (0, control_2.cacheFetch)('/myapi/ask/2');
            main.innerHTML = await resp.text();
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
        const iterations = Math.abs(misc_4.config.tests);
        const ips = (iterations / duration).toFixed();
        const str = 'iterations: ' + iterations + ', duration: ' + duration + ', ips: ' + ips;
        (0, misc_4.mylog)(str);
        return str;
    }
});
define("demo/src/onevents", ["require", "exports", "demo/src/browser2", "demo/src/tests"], function (require, exports, browser2_1, tests_1) {
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
    function onMessage(e) {
        (0, tests_1.perftestpost)(e.data);
    }
    function onPopState(e) {
        (0, browser2_1.clientRequest)(e.state);
    }
    function onClick(e) {
        if (e.target instanceof HTMLAnchorElement) {
            const cmd = e.target.dataset.cmd;
            if (cmd !== undefined) {
                e.preventDefault();
                if (cmd === 'perftest')
                    return (0, tests_1.perftestgui)();
                const path = cmd || e.target.pathname;
                window.history.pushState(path, '');
                document.forms[0].reset();
                (0, browser2_1.clientRequest)(path);
            }
        }
    }
    function onSubmit(e) {
        if (e.target instanceof HTMLFormElement) {
            const cmd = e.target.dataset.cmd;
            if (cmd !== undefined) {
                e.preventDefault();
                const path = e.target.action + '?query=' + e.target.query.value;
                window.history.pushState(path, '');
                (0, browser2_1.clientRequest)(path);
            }
        }
    }
});
define("demo/src/browser", ["require", "exports", "demo/src/misc", "demo/src/browser2", "demo/src/onevents", "demo/src/view"], function (require, exports, misc_5, browser2_2, onevents_1, view_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.browser = void 0;
    async function browser() {
        (0, misc_5.mylog)('browser');
        if (!('fetch' in window)) {
            swfail('Browser not supported.', 'Missing fetch.');
            return;
        }
        const query = window.location.search;
        if (query)
            (0, misc_5.updateConfig)(query.substring(1).split('&'));
        const main = document.getElementById('main');
        if (!main.firstElementChild)
            (0, browser2_2.clientRequest)();
        (0, onevents_1.setupHandlers)();
        startWorker();
    }
    exports.browser = browser;
    function startWorker() {
        if (misc_5.config.worker === 'service' && !misc_5.config.tests) {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js')
                    .then(reg => { (0, browser2_2.setDirect)(); (0, misc_5.mylog)(reg); }, err => swfail('ServiceWorker failed.', err));
            }
            else {
                swfail('ServiceWorker unsupported.', '');
            }
        }
    }
    function swfail(summary, reason) {
        (0, misc_5.mylog)('sw failed:', summary, reason);
        const error = document.getElementById('error');
        const details = reason +
            '<br><br>Ensure cookies are enabled, the connection is secure,' +
            ' the browser is not in private mode and is supported' +
            ' (Chrome on Android, Safari on iOS).';
        error.outerHTML = (0, view_4.renderToMarkup)(details, 'error', summary);
    }
});
define("demo/src/nodejs", ["require", "exports", "fs", "http", "https", "demo/src/misc", "demo/src/control", "demo/src/view", "demo/src/indexes", "demo/src/tests"], function (require, exports, fs, http, https, misc_6, control_3, view_5, indexes_3, tests_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodejs = void 0;
    function nodejs() {
        (0, misc_6.mylog)('nodejs');
        (0, misc_6.updateConfig)(process.argv.slice(2));
        misc_6.config.worker = 'node';
        if (misc_6.config.tests)
            doTests();
        else
            doServer();
    }
    exports.nodejs = nodejs;
    function doTests() {
        (0, tests_2.tests)();
        const news = fs.readFileSync('public/static/news.json', 'utf8');
        const json = JSON.parse(news);
        (0, tests_2.perftest)(json);
        process.exit();
    }
    function doServer() {
        const indexStr = fs.readFileSync('public/index.html', 'utf8');
        (0, indexes_3.setIndexHtml)(indexStr);
        const server = http.createServer(serverRequest).listen(misc_6.config.port);
        (0, misc_6.mylog)('listening', server.address());
    }
    function serverRequest(req, res) {
        let url = req.url;
        (0, misc_6.mylog)('serverRequest', url);
        if (!url)
            return;
        if (url === '/') {
            res.statusCode = 301;
            res.setHeader('Location', '/public/');
            res.end();
            return;
        }
        if (url.startsWith('/public/')) {
            serveFile(url, res);
        }
        else if (url.startsWith('/myapi/')) {
            serveNews(url, res);
        }
        else {
            (0, misc_6.mylog)('unhandled url:', url);
            res.statusCode = 404;
            res.end();
        }
    }
    function serveFile(url, res) {
        const pos = url.indexOf('?');
        if (pos > 0)
            url = url.substring(0, pos);
        if (url === '/public/')
            url = '/public/index.html';
        fs.readFile('.' + url, null, (err, data) => {
            if (err)
                (0, misc_6.mylog)(err.message);
            const type = url.endsWith('.js') ? 'application/javascript' : '';
            setHeaders(res, 3600, type);
            res.end(data);
        });
    }
    function serveNews(path, res) {
        setHeaders(res, 600, 'text/html');
        const { cmd, arg, url } = (0, control_3.path2cmd)(path);
        function sendResp(data) {
            res.end((0, view_5.renderToMarkup)(data, cmd, arg));
        }
        fetchJson(url, sendResp);
    }
    function setHeaders(res, ttl, type) {
        res.statusCode = 200;
        res.setHeader('Date', new Date().toUTCString());
        res.setHeader('Cache-Control', 'max-age=' + ttl);
        if (type)
            res.setHeader('Content-Type', type);
    }
    function fetchJson(url, sendResp) {
        (0, misc_6.mylog)('fetchJson', url);
        https.get(url, clientRequest2)
            .on('error', err => sendResp(err.message));
        function clientRequest2(res2) {
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
                        (0, misc_6.mylog)('Error', err);
                        data = '' + err;
                    }
                    sendResp(data);
                });
            }
        }
    }
});
define("demo/src/worker", ["require", "exports", "demo/src/misc", "demo/src/control"], function (require, exports, misc_7, control_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.sworker = exports.cfworker = void 0;
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
        (0, misc_7.mylog)('sworker');
        misc_7.config.baseurl = '/public';
        (0, control_4.enableCache)();
        self.addEventListener('install', onInstall);
        self.addEventListener('activate', onActivate);
        self.addEventListener('fetch', onFetch);
    }
    exports.sworker = sworker;
    function cfworker() {
        (0, misc_7.mylog)('cfworker');
        misc_7.config.worker = 'cf';
        cfUpdateConfig();
        (0, control_4.enableCache)();
        (0, control_4.setupIndex)();
        self.addEventListener('fetch', onFetch);
    }
    exports.cfworker = cfworker;
    function onInstall(e) {
        (0, misc_7.mylog)('onInstall', e);
        (0, misc_7.mylog)('precache', PRE_CACHE);
        e.waitUntil(caches.open(misc_7.version).then(cache => cache.addAll(PRE_CACHE)).then(() => (0, control_4.cacheRoot)().then(() => self.skipWaiting())));
    }
    function onActivate(e) {
        (0, misc_7.mylog)('onActivate', e);
        e.waitUntil(self.clients.claim().then(() => caches.keys().then(keys => Promise.all(keys.filter(key => key !== misc_7.version).map(name => caches.delete(name))))));
    }
    function onFetch(e) {
        e.respondWith((0, control_4.cacheFetch)(e.request, e));
    }
    function cfUpdateConfig() {
        Object.keys(misc_7.config).forEach(key => {
            const value = self[key.toUpperCase()];
            if (value != null)
                misc_7.config[key] = value;
        });
    }
});
define("demo/src/main", ["require", "exports", "demo/src/misc", "demo/src/nodejs", "demo/src/browser", "demo/src/worker"], function (require, exports, misc_8, nodejs_1, browser_1, worker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    main();
    function main() {
        (0, misc_8.mylog)('main', misc_8.version);
        start();
        (0, misc_8.mylog)('config:', JSON.stringify(misc_8.config));
    }
    function start() {
        if ('Deno' in globalThis)
            (0, misc_8.mylog)('Deno not supported');
        else if ('window' in globalThis)
            (0, browser_1.browser)();
        else if (typeof process === 'object' && process.version)
            (0, nodejs_1.nodejs)();
        else if ('clients' in globalThis && 'skipWaiting' in globalThis)
            (0, worker_1.sworker)();
        else if ('caches' in globalThis && 'default' in globalThis.caches)
            (0, worker_1.cfworker)();
        else {
            console.error('unknown environment', globalThis);
            throw 'unknown environment ' + globalThis;
        }
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
