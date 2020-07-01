"use strict";
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
    "name": "jsxrender",
    "version": "0.9.7f",
    "description": "Small fast stateless subset of React.",
    "main": "public/main.js",
    "repository": {
        "type": "git",
        "url": "https://github.com/martyntebby/jsxrender.git"
    },
    "config": {
        "port": 3000,
        "dolog": false,
        "worker": "service",
        "perftest": 0
    },
    "scripts": {
        "build": "rm -rf dist out public/main.js && tsc -b . --force && node dist/bundle.js",
        "watch": "tsc -b . -w --listEmittedFiles",
        "clean": "rm -rf dist",
        "start": "node .",
        "deno": "deno run --allow-net --allow-read public/main.js",
        "test": "node dist/tests.js"
    },
    "author": "Martyn Tebby",
    "license": "ISC",
    "devDependencies": {
        "@types/node": "12.12.6",
        "@types/react": "^16.9.41",
        "@types/react-dom": "^16.9.8",
        "typescript": "^3.9.5"
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
                    ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
        return jsxrender_1.renderToStaticMarkup(vnode);
    }
    exports.renderToMarkup = renderToMarkup;
    function ItemsView(props) {
        return (jsxrender_1.h("div", null,
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
                jsxrender_1.h(Link, { href: '/item/' + i.id, cmd: true },
                    i.comments_count,
                    " comments"));
        return (jsxrender_1.h("article", { className: i.comments && 'inset' },
            jsxrender_1.h(Link, { className: 'mainlink', href: url, cmd: !i.domain }, i.title),
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
        return jsxrender_1.h(Link, { className: 'bold', href: '/user/' + props.user, cmd: true }, props.user);
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
    let color = 0;
    function PagerView(props) {
        const nolink = props.page > 1 ? undefined : 'nolink';
        const prev = jsxrender_1.h(Link, { href: `/${props.cmd}/${props.page - 1}`, cmd: true, className: nolink }, "\u2190 prev");
        const next = jsxrender_1.h(Link, { href: `/${props.cmd}/${props.page + 1}`, cmd: true, prefetch: !package_json_1.config.perftest }, "next \u2192");
        const style = package_json_1.config.perftest ? `color:hsl(${++color / 10},100%,50%)` : 'pointer-events:none';
        const page = jsxrender_1.h("a", { style: style, "data-cmd": 'perftest' },
            "page ",
            props.page);
        return (jsxrender_1.h("div", { className: 'pager' },
            prev,
            " ",
            page,
            " ",
            next,
            " ",
            jsxrender_1.h(LogsView, null)));
    }
    function LogsView() {
        return logs.length === 0 ? null : (jsxrender_1.h("details", null,
            jsxrender_1.h("summary", null, "Logs"),
            jsxrender_1.h("pre", null, logs.join('\n')),
            logs = []));
    }
    function Link(props) {
        const href = (props.cmd ? '/myapi' : '') + props.href;
        const target = props.cmd ? '_self' : undefined;
        const prefetch = props.prefetch ? jsxrender_1.h("link", { rel: 'prefetch', href: href }) : undefined;
        const a = jsxrender_1.h("a", { href: href, className: props.className, target: target, "data-cmd": props.cmd }, props.children);
        return props.prefetch ? jsxrender_1.h("span", null,
            prefetch,
            a) : a;
    }
    function ErrorView(err, summary) {
        const open = !summary;
        summary = summary || 'Error';
        return jsxrender_1.h("details", { open: open, className: 'error' },
            jsxrender_1.h("summary", null, summary),
            err);
    }
});
define("demo/src/control", ["require", "exports", "demo/src/view", "demo/src/view", "package", "package"], function (require, exports, view_1, view_2, package_json_2, package_json_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.perftest = exports.updateConfig = exports.splitIndexMain = exports.setupIndexStrs = exports.request2cmd = exports.cacheFetch = void 0;
    Object.defineProperty(exports, "mylog", { enumerable: true, get: function () { return view_1.mylog; } });
    Object.defineProperty(exports, "renderToMarkup", { enumerable: true, get: function () { return view_1.renderToMarkup; } });
    Object.defineProperty(exports, "config", { enumerable: true, get: function () { return package_json_2.config; } });
    Object.defineProperty(exports, "version", { enumerable: true, get: function () { return package_json_2.version; } });
    const STATIC_TTL = 60 * 60 * 24;
    const DYNAMIC_TTL = 60 * 10;
    const BASE_URL = 'https://jsxrender.westinca.com/public';
    const MAIN_SITE_INDEX = BASE_URL + '/index.html';
    ;
    let isServer;
    let indexStrs;
    async function getCache() {
        return caches.default || await caches.open(package_json_3.version);
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
        view_2.mylog('cacheFetch', reqstr);
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
                (package_json_3.config.worker !== 'cf' ? resp3.type === 'basic' : resp3.url === MAIN_SITE_INDEX))) {
            const p = cache.put(request, resp3.clone());
            evt === null || evt === void 0 ? void 0 : evt.waitUntil(p);
        }
        return resp3;
    }
    async function api2response(resp, cmd, arg) {
        const data = await resp.json();
        let html = view_2.renderToMarkup(cmd, arg, data);
        if (isServer) {
            const sections = await getIndexStrs();
            if (sections)
                html = sections[0] + html + sections[2];
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
        view_2.mylog('setupIndexStrs', server);
        if (!indexStrs) {
            if (server !== undefined)
                isServer = server;
            const url = isServer ? MAIN_SITE_INDEX : '/public/index.html';
            const resp = await cacheFetch(url);
            if (resp.ok) {
                const index = await resp.text();
                indexStrs = splitIndexMain(index);
                if (!isServer) {
                    const cache = await getCache();
                    cache === null || cache === void 0 ? void 0 : cache.put('./', html2response(indexStrs[0] + indexStrs[2], STATIC_TTL));
                }
            }
        }
        return indexStrs;
    }
    exports.setupIndexStrs = setupIndexStrs;
    function splitIndexMain(text) {
        const main = '<main id="main">';
        const pos1 = text.indexOf(main) + main.length;
        const pos2 = text.indexOf('</main>', pos1);
        return [text.substring(0, pos1), text.substring(pos1, pos2), text.substring(pos2)];
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
        return cmd === 'newest'
            ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
            : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
    }
    function updateConfig(args) {
        args.forEach(arg => {
            const [key, value] = arg.split('=');
            if (key in package_json_3.config)
                package_json_3.config[key] = value !== null && value !== void 0 ? value : true;
        });
    }
    exports.updateConfig = updateConfig;
    async function perftest(items, func) {
        if (!items) {
            const res = await cacheFetch(BASE_URL + '/static/news.json');
            return perftest(await res.json(), func);
        }
        view_2.mylog('perftest', package_json_3.config.perftest);
        const iterations = package_json_3.config.perftest < 0 ? -package_json_3.config.perftest
            : package_json_3.config.perftest > 1 ? package_json_3.config.perftest : 10000;
        return perfs(iterations, () => {
            const str = view_2.renderToMarkup('news', '1', items);
            if (func)
                func(str);
        });
    }
    exports.perftest = perftest;
    function perfs(iterations, func) {
        const start = Date.now();
        for (let i = iterations; i > 0; --i)
            func();
        const end = Date.now();
        const duration = (end - start) / 1000.0;
        const tps = (iterations / duration).toFixed();
        const str = 'iterations: ' + iterations + '  duration: ' + duration + '  tps: ' + tps;
        view_2.mylog(str);
        return str;
    }
});
define("demo/src/browser", ["require", "exports", "demo/src/control"], function (require, exports, control_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.browser = void 0;
    let sw = false;
    async function browser() {
        control_1.mylog('browser');
        if (!('fetch' in window)) {
            swfail('Browser not supported.', 'Missing fetch.');
            return;
        }
        const query = window.location.search;
        if (query)
            control_1.updateConfig(query.substring(1).split('&'));
        const main = document.getElementById('main');
        if (!main.firstElementChild)
            clientRequest();
        window.onpopstate = onPopState;
        document.body.onclick = onClick;
        startWorker();
    }
    exports.browser = browser;
    function startWorker() {
        if (control_1.config.worker === 'service') {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('sw.js')
                    .then(reg => { sw = true; control_1.mylog(reg); }, err => swfail('ServiceWorker failed.', err));
            }
            else {
                swfail('ServiceWorker unsupported.', '');
            }
        }
    }
    function swfail(summary, reason) {
        control_1.mylog('sw failed:', summary, reason);
        const error = document.getElementById('error');
        error.outerHTML = control_1.renderToMarkup('', summary, reason +
            '<br><br>Ensure cookies are enabled, the connection is secure,' +
            ' the browser is not in private mode and is supported' +
            ' (Chrome on Android, Safari on iOS).');
    }
    function onPopState(e) {
        clientRequest(e.state);
    }
    function onClick(e) {
        if (e.target instanceof HTMLAnchorElement) {
            const cmd = e.target.dataset.cmd;
            if (cmd !== undefined) {
                e.preventDefault();
                if (cmd === 'perftest') {
                    perftest2();
                    return;
                }
                const path = cmd || e.target.pathname;
                window.history.pushState(path, '');
                clientRequest(path);
            }
        }
    }
    async function clientRequest(path) {
        path = path || '/myapi/news/1';
        const markupp = fetchPath(path);
        const { cmd } = control_1.request2cmd(path);
        const nav = document.getElementById('nav');
        const main = document.getElementById('main');
        const child = main.firstElementChild;
        if (child)
            child.className = 'loading';
        main.innerHTML = await markupp;
        nav.className = cmd || 'other';
        window.scroll(0, 0);
    }
    async function fetchPath(path) {
        const func = sw ? fetch : control_1.cacheFetch;
        try {
            const resp = await func(path);
            return await resp.text();
        }
        catch (err) {
            return control_1.renderToMarkup('', '', err + ' Maybe offline?');
        }
    }
    async function perftest2() {
        const main = document.getElementById('main');
        const func = control_1.config.perftest > 0 ? undefined :
            (str) => main.innerHTML = str;
        main.innerHTML = 'perftest ' + control_1.config.perftest + ' ...';
        main.innerHTML = await control_1.perftest(undefined, func);
    }
});
define("demo/src/nodejs", ["require", "exports", "fs", "http", "https", "demo/src/control"], function (require, exports, fs, http, https, control_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodejs = void 0;
    let indexStrs;
    function nodejs() {
        control_2.mylog('nodejs');
        control_2.updateConfig(process.argv.slice(2));
        control_2.config.worker = 'node';
        if (control_2.config.perftest)
            doPerfTest();
        else
            doServer();
    }
    exports.nodejs = nodejs;
    function doPerfTest() {
        const news = fs.readFileSync('public/static/news.json', 'utf8');
        const json = JSON.parse(news);
        control_2.perftest(json);
        process.exit();
    }
    function doServer() {
        const indexStr = fs.readFileSync('public/index.html', 'utf8');
        indexStrs = control_2.splitIndexMain(indexStr);
        const server = http.createServer(serverRequest).listen(control_2.config.port);
        control_2.mylog('listening', server.address());
    }
    function serverRequest(req, res) {
        let url = req.url;
        control_2.mylog('serverRequest', url);
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
                    control_2.mylog(err.message);
                res.statusCode = 200;
                res.setHeader('Date', new Date().toUTCString());
                res.setHeader('Cache-Control', 'max-age=3600');
                res.end(data);
            });
            return;
        }
        if (url.startsWith('/myapi/')) {
            serveNews(url, res);
        }
        else {
            control_2.mylog('unhandled url:', url);
            res.statusCode = 404;
            res.end();
        }
    }
    function serveNews(path, res) {
        const { cmd, arg, req } = control_2.request2cmd(path);
        res.statusCode = 200;
        res.setHeader('Date', new Date().toUTCString());
        res.setHeader('Cache-Control', 'max-age=600');
        res.setHeader('Content-Type', 'text/html');
        res.write(indexStrs[0]);
        function sendResp(data) {
            res.write(control_2.renderToMarkup(cmd, arg, data));
            res.end(indexStrs[2]);
        }
        fetchJson(req, sendResp);
    }
    function fetchJson(url, sendResp) {
        control_2.mylog('fetchJson', url);
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
                        data = err.toString();
                    }
                    sendResp(data);
                });
            }
        }
    }
});
define("demo/src/worker", ["require", "exports", "demo/src/control"], function (require, exports, control_3) {
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
        control_3.mylog('sworker');
        self.addEventListener('install', onInstall);
        self.addEventListener('activate', onActivate);
        self.addEventListener('fetch', onFetch);
    }
    exports.sworker = sworker;
    function cfworker() {
        control_3.mylog('cfworker');
        self.addEventListener('fetch', onFetch);
        cfUpdateConfig();
        control_3.setupIndexStrs(true);
    }
    exports.cfworker = cfworker;
    function worker() {
        control_3.mylog('worker');
        self.addEventListener('message', onMessage);
        control_3.setupIndexStrs(false);
    }
    exports.worker = worker;
    function onInstall(e) {
        control_3.mylog('onInstall', e);
        control_3.mylog('precache', PRE_CACHE);
        e.waitUntil(caches.open(control_3.version).then(cache => cache.addAll(PRE_CACHE)).then(() => control_3.setupIndexStrs(false).then(() => self.skipWaiting())));
    }
    function onActivate(e) {
        control_3.mylog('onActivate', e);
        e.waitUntil(self.clients.claim().then(() => caches.keys().then(keys => Promise.all(keys.filter(key => key !== control_3.version).map(name => caches.delete(name))))));
    }
    function onFetch(e) {
        e.respondWith(control_3.cacheFetch(e.request, e));
    }
    function onMessage(e) {
        control_3.cacheFetch(e.data)
            .then(res => res.text()
            .then(text => self.postMessage(text)));
    }
    function cfUpdateConfig() {
        Object.keys(control_3.config).forEach(key => {
            const value = self[key.toUpperCase()];
            if (value != null)
                control_3.config[key] = value;
        });
        control_3.config.worker = 'cf';
    }
});
define("demo/src/main", ["require", "exports", "demo/src/control", "demo/src/nodejs", "demo/src/browser", "demo/src/worker"], function (require, exports, control_4, nodejs_1, browser_1, worker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    main();
    function main() {
        control_4.mylog('main', control_4.version);
        if ('Deno' in globalThis)
            control_4.mylog('deno not implemented');
        else if ('window' in globalThis)
            browser_1.browser();
        else if (typeof process === 'object' && process.version)
            nodejs_1.nodejs();
        else if ('clients' in globalThis && 'skipWaiting' in globalThis)
            worker_1.sworker();
        else if ('caches' in globalThis && 'default' in globalThis.caches)
            worker_1.cfworker();
        else if ('importScripts' in globalThis)
            worker_1.worker();
        else {
            console.error('unknown environment', globalThis);
            throw 'unknown environment ' + globalThis;
        }
        control_4.mylog('config:', JSON.stringify(control_4.config));
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
