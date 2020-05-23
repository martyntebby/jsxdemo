"use strict";
define("src/jsxrender", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderToStaticMarkup = exports.Fragment = exports.jsxs = exports.jsx = exports.createElement = exports.h = void 0;
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
    function doChildren(children) {
        if (!Array.isArray(children))
            return doChild(children);
        let str = '';
        for (const child of children)
            str += doChild(child);
        return str;
    }
    function doChild(child) {
        if (child == null || typeof child === 'boolean')
            return '';
        if (Array.isArray(child))
            return doChildren(child);
        if (typeof child === 'string')
            return child;
        return child.toString();
    }
    function doProp(name, value) {
        if (name === 'children' || name === 'key' || name === 'ref' ||
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
    function jsx(type, props) {
        return typeof type === 'function' ? type(props)
            : doElement(type, props, props.children);
    }
    exports.jsx = jsx;
    exports.jsxs = jsx;
});
define("package", [], {
    "name": "jsxrender",
    "version": "0.9.5",
    "description": "Small fast stateless subset of React.",
    "main": "public/main.js",
    "repository": {
        "type": "git",
        "url": "https://github.com/martyntebby/jsxrender.git"
    },
    "config": {
        "port": 3000,
        "cfttl": 1800,
        "dolog": false,
        "useapi": false
    },
    "scripts": {
        "build": "rm -rf dist out public/sw.js && tsc -b . --force && (cd demo; node ../dist/bundle.js)",
        "watch": "tsc -b . -w --listEmittedFiles",
        "clean": "rm -rf dist",
        "test": "node dist/test/tests.js"
    },
    "author": "Martyn Tebby",
    "license": "ISC",
    "devDependencies": {
        "@types/node": "12.12.6",
        "@types/react": "^16.9.35",
        "@types/react-dom": "^16.9.8",
        "typescript": "^3.9.2"
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
        const vnode = typeof data === 'string' ? ErrorView(data) :
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
    function ErrorView(err) {
        return jsxrender_1.h("div", { className: 'error' },
            "Error: ",
            err);
    }
});
define("demo/src/control", ["require", "exports", "demo/src/view", "demo/src/view", "package", "package"], function (require, exports, view_1, view_2, package_json_2, package_json_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateConfig = exports.link2cmd = exports.fetchData = exports.fetchMarkup = void 0;
    Object.defineProperty(exports, "mylog", { enumerable: true, get: function () { return view_1.mylog; } });
    Object.defineProperty(exports, "renderToMarkup", { enumerable: true, get: function () { return view_1.renderToMarkup; } });
    Object.defineProperty(exports, "config", { enumerable: true, get: function () { return package_json_2.config; } });
    Object.defineProperty(exports, "version", { enumerable: true, get: function () { return package_json_2.version; } });
    async function fetchMarkup(path, init, useapi) {
        const { cmd, arg, url } = link2cmd(path, useapi);
        const data = await fetchData(url, init, !useapi);
        const markup = useapi ? data : view_2.renderToMarkup(cmd, arg, data);
        return { markup, cmd, arg };
    }
    exports.fetchMarkup = fetchMarkup;
    async function fetchData(url, init, json) {
        view_2.mylog('fetchData', url);
        try {
            const resp = await fetch(url, init);
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
    exports.fetchData = fetchData;
    function link2cmd(path, useapi) {
        path = path || '';
        const strs = path.split('/');
        const cmd = strs[1] || 'news';
        const arg = strs[2] || '1';
        const url = cmd2url(cmd, arg, useapi);
        return { cmd, arg, url };
    }
    exports.link2cmd = link2cmd;
    function cmd2url(cmd, arg, useapi) {
        return useapi ? `/myapi/${cmd}/${arg}`
            : cmd === 'newest'
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
});
define("demo/src/browser", ["require", "exports", "demo/src/control"], function (require, exports, control_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.browser = void 0;
    let useapi = false;
    function browser() {
        var _a;
        control_1.mylog('browser');
        const query = window.location.search;
        if (query)
            control_1.updateConfig(query.substring(1).split('&'));
        const main = document.getElementById('main');
        if (!main.firstElementChild)
            clientRequest();
        window.onpopstate = onPopState;
        document.body.onclick = onClick;
        (_a = navigator.serviceWorker) === null || _a === void 0 ? void 0 : _a.register('../public/sw.js').then(reg => { control_1.mylog(reg); useapi = control_1.config.useapi; });
    }
    exports.browser = browser;
    function onPopState(e) {
        clientRequest(e.state);
    }
    function onClick(e) {
        if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
            clientRequest(e.target.pathname);
            e.preventDefault();
            window.history.pushState(e.target.pathname, '');
        }
    }
    async function clientRequest(path) {
        const datap = control_1.fetchMarkup(path, undefined, useapi);
        const nav = document.getElementById('nav');
        const main = document.getElementById('main');
        const child = main.firstElementChild;
        if (child)
            child.className = 'loading';
        const { markup, cmd, arg } = await datap;
        main.innerHTML = markup;
        nav.className = cmd;
        window.scroll(0, 0);
    }
});
define("demo/src/cfworker", ["require", "exports", "demo/src/control"], function (require, exports, control_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cfworker = void 0;
    function cfworker() {
        control_2.mylog('cfworker');
        updateConfig();
        self.addEventListener('fetch', e => e.respondWith(handleRequest(e)));
    }
    exports.cfworker = cfworker;
    function updateConfig() {
        Object.keys(control_2.config).forEach(key => {
            const value = self[key.toUpperCase()];
            if (value != null)
                control_2.config[key] = value;
        });
    }
    async function handleRequest(e) {
        const request = e.request;
        const cache = caches.default;
        let response = await cache.match(request);
        if (response)
            return response;
        const init = { cf: { cacheTtl: control_2.config.cfttl } };
        const path = new URL(request.url).pathname;
        const markupp = control_2.fetchMarkup(path.substring(1), init);
        let index = '';
        let pos = -1;
        if (path === '/public/') {
            index = await control_2.fetchData('https://jsxrender.westinca.com/public/index.html', init);
            pos = index.indexOf('</main>');
            if (pos < 0)
                return new Response(index);
        }
        const { markup } = await markupp;
        const str = index ? index.substring(0, pos) + markup + index.substring(pos) : markup;
        const headers = [
            ['Content-Type', 'text/html'],
            ['Cache-Control', 'max-age=' + control_2.config.cfttl]
        ];
        response = new Response(str, { headers: headers });
        e.waitUntil(cache.put(request, response.clone()));
        return response;
    }
});
define("demo/src/nodejs", ["require", "exports", "fs", "http", "https", "demo/src/control"], function (require, exports, fs, http, https, control_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodejs = void 0;
    let indexHtmlStr = '';
    let mainPos = 0;
    function nodejs() {
        control_3.mylog('nodejs');
        control_3.updateConfig(process.argv.slice(2));
        indexHtmlStr = fs.readFileSync('public/index.html', 'utf8');
        mainPos = indexHtmlStr.indexOf('</main>');
        http.createServer(serverRequest).listen(control_3.config.port);
    }
    exports.nodejs = nodejs;
    function serverRequest(req, res) {
        let url = req.url;
        control_3.mylog('serverRequest', url);
        if (!url)
            return;
        const pos = url.indexOf('?');
        if (pos > 0)
            url = url.substring(0, pos);
        if (url.startsWith('/static/'))
            url = '/public' + url;
        if (url.startsWith('/public/')) {
            fs.readFile('.' + url, null, (err, data) => {
                if (err)
                    control_3.mylog(err.message);
                res.statusCode = 200;
                res.end(data);
            });
            return;
        }
        serveNews(url, res);
    }
    function serveNews(path, res) {
        const { cmd, arg, url } = control_3.link2cmd(path);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(indexHtmlStr.substring(0, mainPos));
        https.get(url, clientRequest)
            .on('error', err => sendResp(err.message));
        function sendResp(data) {
            res.write(control_3.renderToMarkup(cmd, arg, data));
            res.end(indexHtmlStr.substring(mainPos));
        }
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
define("demo/src/main", ["require", "exports", "demo/src/control", "demo/src/nodejs", "demo/src/browser", "demo/src/cfworker"], function (require, exports, control_4, nodejs_1, browser_1, cfworker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    main();
    function main() {
        control_4.mylog('main', control_4.version);
        if ('window' in globalThis)
            browser_1.browser();
        else if (typeof process === 'object' && process.version)
            nodejs_1.nodejs();
        else if ('caches' in globalThis && 'default' in globalThis.caches)
            cfworker_1.cfworker();
        else if ('clients' in globalThis && 'skipWaiting' in globalThis)
            control_4.mylog('service worker');
        else {
            console.error('unknown environment', globalThis);
            throw 'unknown environment ' + globalThis;
        }
        control_4.mylog('config', JSON.stringify(control_4.config));
    }
});
function define(name, params, func) {
    const _self = globalThis;
    _self.myexports = _self.myexports || {};
    if (typeof func !== 'function') {
        _self.myexports[name] = func;
        return;
    }
    const req = typeof require === 'undefined' ? undefined : require;
    const args = [req, _self.myexports[name] = {}];
    for (let i = 2; i < params.length; ++i) {
        args[i] = _self.myexports[params[i]] || (req && req(params[i]));
    }
    func.apply(null, args);
}
