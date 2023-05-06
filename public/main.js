"use strict";
define("package", [], {
    "name": "jsxdemo",
    "version": "0.9.9f",
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
        "worker": "",
        "tests": 0
    },
    "scripts": {
        "install": "ln -sf node_modules/jsxrender/src .",
        "build": "rm -rf dist public/main.js && tsc -p scripts && node dist/bundle.js && tsc -p demo",
        "watch": "tsc -b . -w --listEmittedFiles",
        "clean": "rm -rf dist",
        "start": "node .",
        "node": "node .",
        "test": "node . tests=1",
        "perf": "node . tests=10000",
        "deno": "deno run --allow-net --allow-read public/main.js"
    },
    "author": "Martyn Tebby",
    "license": "ISC",
    "devDependencies": {
        "typescript": "5.0.4",
        "@types/node": "18.15.12",
        "@types/react": "^18.0.37",
        "@types/react-dom": "^18.0.11",
        "jsxrender": "martyntebby/jsxrender"
    },
    "dependencies": {}
});
define("demo/src/types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ;
    ;
});
define("demo/src/misc", ["require", "exports", "package", "package"], function (require, exports, package_json_1, package_json_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.version = exports.config = exports.path2cmd = exports.updateConfig = exports.resetLog = exports.mylog = void 0;
    Object.defineProperty(exports, "config", { enumerable: true, get: function () { return package_json_1.config; } });
    Object.defineProperty(exports, "version", { enumerable: true, get: function () { return package_json_1.version; } });
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
    function updateConfig(args, extra) {
        if (Array.isArray(args))
            updateConfig1(args);
        else
            updateConfig2(args, true);
        if (extra)
            updateConfig2(extra, false);
        mylog('config', JSON.stringify(package_json_2.config));
        return package_json_2.config;
    }
    exports.updateConfig = updateConfig;
    function updateConfig1(args) {
        args.forEach(arg => {
            const [key, value] = arg.split('=');
            if (key in package_json_2.config)
                package_json_2.config[key] = value ?? true;
        });
    }
    function updateConfig2(env, upper) {
        Object.keys(package_json_2.config).forEach(key => {
            const key2 = upper ? key.toUpperCase() : key;
            const value = env[key2];
            if (value != null)
                package_json_2.config[key] = value;
        });
    }
    function path2cmd(path, log) {
        const re = /\/|\?/;
        const strs = path.split(re);
        const api = path === '/' || strs[1] === 'myapi';
        const cmd = !api ? '' : strs[2] || 'news';
        const arg = !api ? '' : strs[3] || '1';
        const url = !api ? '' : cmd2url(cmd, arg);
        const ret = { cmd, arg, url };
        if (log)
            mylog('path2cmd', path, ret);
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
define("dist/indexes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.indexes = void 0;
    const indexes = [
        `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>JSX Hacker News</title>
  <link rel="manifest" href="/public/static/manifest.json">
  <link rel="icon" href="/public/static/favicon-32.png">
  <link rel="apple-touch-icon" href="/public/static/favicon-256.png">
  <base rel="noopener noreferrer nofollow" target="_blank"/>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="description" content="Sample Hacker News app using jsxrender"/>
  <meta name="theme-color" content="orange"/>
  <style>
body {
  margin: 0;
  overflow-y: scroll;
}
.error {
  color: red;
  margin: 0.5rem;
  padding: 0.5rem;
  border: 0.1rem solid red;
}
#nav:not(.other) + .error {
  display: none;
}
.pager {
  position: fixed;
  width: 100%;
  z-index: 1;
  bottom: 0;
  background: lightyellow;
  padding: 0.5rem;
  display: flex;
  justify-content: space-evenly;
  box-shadow: 0 -1px 1px rgba(0,0,0,0.1);
}
#nav {
  position: sticky;
  z-index: 1;
  top: 0;
  background: orange;
  padding: 0 0.5rem;
  display: flex;
  justify-content: space-between;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
#nav > a {
  margin: 0.5rem 0.5rem;
}
#nav > form {
  flex-grow: 1;
  text-align: center;
  align-self: center;
}
#nav > a.intro {
  font-weight: bold;
  color: purple;
}
.intro>.intro, .news>.news, .newest>.newest, .show>.show, .ask>.ask, .jobs>.jobs {
  text-decoration: underline;
  text-decoration-thickness: 0.1rem;
}
#main {
  margin: 0;
  overflow-wrap: break-word;
}
.inset {
  padding: 1rem;
}
.ol {
  margin-left: 1rem;
  margin-bottom: 3.5rem;
}
.li {
  margin-bottom: 0.5rem;
}
.details {
  margin-top: 0.5rem;
  margin-left: 1rem;
}
a[data-cmd], .mainlink {
  color: black;
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}
.bold {
  font-weight: bold;
}
.large {
  font-size: large;
}
.smallgrey {
  font-size: small;
  color: #666;
}
.loading {
  cursor: progress;
  opacity: 0.1;
  transition: opacity 1s;
}
.nolink {
  color: #666 !important;
  pointer-events: none;
}

@media (max-width: 28rem) {
  .optional {
    display: none;
  }
  .pager {
    position: static;
    padding-bottom: 2rem;
  }
}
</style>
</head>
<body>
  <nav id="nav" class="
`, `
">
    <a href="/public/index.html" class="intro optional" target="_self"
      data-cmd="/public/static/intro.html">JSX</a>
    <a href="/myapi/news/1"   class="news"   target="_self" data-cmd>top</a>
    <a href="/myapi/newest/1" class="newest" target="_self" data-cmd>new</a>
    <a href="/myapi/show/1"   class="show"   target="_self" data-cmd>show</a>
    <a href="/myapi/ask/1"    class="ask"    target="_self" data-cmd>ask</a>
    <a href="/myapi/jobs/1"   class="jobs"   target="_self" data-cmd>jobs</a>
    <form action="/myapi/search" class="search optional" target="_self" data-cmd>
      <input type="search" placeholder="search" name="query">
    </form>
    <a href="https://github.com/martyntebby/jsxdemo" class="mainlink">about</a>
  </nav>
  <noscript id="error"><div class="error">
    Works best with JavaScript.
  </div></noscript>
  <main id="main">
`, `
</main>
  <script async type="module" src="/public/main.js"></script>
</body>
</html>

`
    ];
    exports.indexes = indexes;
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
define("demo/src/view", ["require", "exports", "dist/indexes", "demo/src/misc", "src/jsxrender"], function (require, exports, indexes_1, misc_1, jsxrender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.renderToMarkup = void 0;
    function renderToMarkup(data, cmd, arg) {
        const vnode = renderToJSX(data, cmd, arg);
        const str = (0, jsxrender_1.renderToStaticMarkup)(vnode);
        const useFull = misc_1.config.worker === 'node' || misc_1.config.worker === 'cf';
        return useFull ? indexes_1.indexes[0] + cmd + indexes_1.indexes[1] + str + indexes_1.indexes[2] : str;
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
        const icount = i.comments_count || i.num_comments || 0;
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
        const comments = (0, jsxrender_1.h)("span", null,
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
        const prefetch = misc_1.config.worker !== '' && misc_1.config.worker !== 'web' && !misc_1.config.tests;
        const next = (0, jsxrender_1.h)(Link, { href: `/${props.cmd}/${props.page + 1}`, cmd: true, prefetch: prefetch }, "next \u2192");
        const style = misc_1.config.tests ? `color:hsl(${++color},100%,50%)` : 'pointer-events:none';
        const page = (0, jsxrender_1.h)("a", { style: style, "data-cmd": 'perftest' },
            "page ",
            props.page);
        return ((0, jsxrender_1.h)("div", { className: 'pager' },
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
define("demo/src/server", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DYNAMIC_TTL = exports.STATIC_TTL = exports.htmlResp = exports.otherResp = exports.fileResp = exports.newHeaders = exports.modFilePath = exports.ext2type = void 0;
    exports.STATIC_TTL = 60 * 60 * 24;
    exports.DYNAMIC_TTL = 60 * 10;
    function ext2type(path) {
        if (path.endsWith('.js'))
            return 'application/javascript';
        if (path.endsWith('.json'))
            return 'application/json';
        if (path.endsWith('.png'))
            return 'image/png';
        return 'text/html';
    }
    exports.ext2type = ext2type;
    function modFilePath(path) {
        const pos = path.indexOf('?');
        if (pos > 0)
            path = path.substring(0, pos);
        if (path === '/public/')
            path = '/public/index.html';
        if (path === '/favicon.ico')
            path = '/public/static/favicon-32.png';
        return path;
    }
    exports.modFilePath = modFilePath;
    function newHeaders(ttl, type, len = 0) {
        return {
            'Date': new Date().toUTCString(),
            'Cache-Control': 'max-age=' + ttl,
            'Content-Type': type,
            'Content-Length': '' + len,
        };
    }
    exports.newHeaders = newHeaders;
    function otherResp(path) {
        const redirect = path === '/';
        return {
            status: redirect ? 301 : 406,
            statusText: redirect ? 'Moved Permanently' : 'Not Acceptable',
            headers: redirect ? { 'Location': '/public/' } : undefined,
            body: undefined
        };
    }
    exports.otherResp = otherResp;
    function fileResp(path, data) {
        const ok = !!data;
        return {
            status: ok ? 200 : 404,
            statusText: ok ? 'OK' : 'File Not Found',
            headers: ok ? newHeaders(3600, ext2type(path), data?.length) : undefined,
            body: data,
        };
    }
    exports.fileResp = fileResp;
    function htmlResp(html, ttl) {
        const headers = newHeaders(ttl, 'text/html', html.length);
        return new Response(html, { headers: headers, status: 200, statusText: 'OK' });
    }
    exports.htmlResp = htmlResp;
});
define("demo/src/control", ["require", "exports", "demo/src/misc", "demo/src/view", "demo/src/server"], function (require, exports, misc_2, view_1, server_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cacheFetch = exports.enableCache = void 0;
    let useCache = false;
    function enableCache() {
        useCache = true;
    }
    exports.enableCache = enableCache;
    async function cacheFetch(request, evt) {
        const path = req2path(request);
        try {
            const cache = await getCache();
            const { cmd, arg, url } = (0, misc_2.path2cmd)(path);
            const { cached, current } = await cacheMatch(cache, request, cmd);
            if (cached && current)
                return cached;
            const ttl = cmd ? server_1.DYNAMIC_TTL : server_1.STATIC_TTL;
            const resp2 = await fetchCF(url || request, ttl);
            if (!resp2.ok)
                return cached ?? resp2;
            const resp3 = await api2resp(resp2, cmd, arg);
            if (cache && cacheable(resp3, cmd, arg)) {
                const p = cache.put(request, resp3.clone());
                evt?.waitUntil(p);
            }
            return resp3;
        }
        catch (err) {
            (0, misc_2.mylog)('Error', err);
            return new Response(err);
        }
    }
    exports.cacheFetch = cacheFetch;
    function getCache() {
        const cache = useCache ? (caches.default || caches.open(misc_2.version)) : undefined;
        return cache;
    }
    function req2path(request) {
        if (typeof request === 'string')
            return request;
        const url = new URL(request.url);
        return url.pathname + url.search;
    }
    async function cacheMatch(cache, request, cmd) {
        const cached = cache && await cache.match(request);
        const current = !!cached && (!cmd ||
            (Date.now() - (Date.parse(cached.headers.get('Date') ?? '')) < server_1.DYNAMIC_TTL * 1000));
        return { cached, current };
    }
    function fetchCF(req, ttl) {
        const init = { cf: { cacheTtl: ttl } };
        return fetch(req, init);
    }
    async function api2resp(resp, cmd, arg) {
        if (!cmd)
            return resp;
        const data = resp.json();
        const html = (0, view_1.renderToMarkup)(await data, cmd, arg);
        return (0, server_1.htmlResp)(html, server_1.DYNAMIC_TTL);
    }
    function cacheable(resp3, cmd, arg) {
        return (resp3.ok &&
            (cmd === 'news' || cmd === 'newest' || arg === '1' ||
                (misc_2.config.worker === 'cf'
                    ? resp3.url === misc_2.config.baseurl + '/index.html'
                    : resp3.type === 'basic')));
    }
});
define("demo/src/browser2", ["require", "exports", "demo/src/view", "demo/src/control", "demo/src/misc"], function (require, exports, view_2, control_1, misc_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fetchPaint = exports.setWorker = void 0;
    let cmd = '';
    let direct = false;
    let worker;
    function setWorker(work) {
        (0, misc_3.mylog)('setWorker', work);
        worker = work;
        direct = true;
        if (worker) {
            worker.onmessage = e => paint(e.data);
        }
    }
    exports.setWorker = setWorker;
    async function fetchPaint(path) {
        path = path || '/myapi/news/1';
        cmd = (0, misc_3.path2cmd)(path).cmd;
        const main = document.getElementById('main');
        const child = main.firstElementChild;
        if (child)
            child.className = 'loading';
        if (worker) {
            worker.postMessage(path);
        }
        else {
            paint(await fetchPath(path));
        }
    }
    exports.fetchPaint = fetchPaint;
    function paint(html) {
        const nav = document.getElementById('nav');
        const main = document.getElementById('main');
        main.innerHTML = html;
        nav.className = cmd || 'other';
        window.scroll(0, 0);
    }
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
define("demo/src/tests", ["require", "exports", "demo/src/misc", "demo/src/server", "demo/src/view"], function (require, exports, misc_4, server_2, view_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.perfStr = exports.perfTest = exports.tests = void 0;
    function tests() {
        (0, misc_4.mylog)('tests');
        configTest();
        pathTest(false);
        serverTest();
        (0, misc_4.mylog)('finished');
    }
    exports.tests = tests;
    function myassert(test, ...args) {
        console.assert(test, ...args);
    }
    function configTest() {
        (0, misc_4.mylog)('configTest');
        myassert((0, misc_4.updateConfig)(['worker=worker1']).worker === 'worker1');
        myassert((0, misc_4.updateConfig)({ WORKER: 'worker2' }).worker === 'worker2');
        myassert((0, misc_4.updateConfig)([], { worker: 'worker3' }).worker === 'worker3');
    }
    function pathTest(log = true) {
        (0, misc_4.mylog)('pathTest');
        const empty = (0, misc_4.path2cmd)('', log);
        const myapi = (0, misc_4.path2cmd)('/myapi', log);
        const search = (0, misc_4.path2cmd)('/myapi/search?query=abc&page=3', log);
        myassert('' === empty.cmd);
        myassert('' === empty.arg);
        myassert('' === empty.url);
        myassert('news' === myapi.cmd);
        myassert('1' === myapi.arg);
        myassert(!!myapi.url);
        myassert('search' === search.cmd);
    }
    function serverTest() {
        (0, misc_4.mylog)('serverTest');
        myassert((0, server_2.modFilePath)('a?b') === 'a');
        myassert((0, server_2.fileResp)('abc').status === 404);
        myassert((0, server_2.fileResp)('abc.png', new Uint8Array(1)).headers?.['Content-Type'] === 'image/png');
        myassert((0, server_2.otherResp)('abc').status === 406);
        myassert((0, server_2.otherResp)('/').headers?.Location === '/public/');
    }
    function perfTest(data) {
        (0, misc_4.mylog)('perftest', misc_4.config.tests);
        const start = Date.now();
        for (let i = misc_4.config.tests; i > 0; --i) {
            const str = (0, view_3.renderToMarkup)(data, 'news', '1');
        }
        return perfStr(start);
    }
    exports.perfTest = perfTest;
    function perfStr(start) {
        const duration = (Date.now() - start) / 1000;
        const iterations = Math.abs(misc_4.config.tests);
        const ips = (iterations / duration).toFixed();
        const str = 'iterations: ' + iterations + ', duration: ' + duration + ', ips: ' + ips;
        (0, misc_4.mylog)(str);
        return str;
    }
    exports.perfStr = perfStr;
});
define("demo/src/tests2", ["require", "exports", "demo/src/misc", "demo/src/control", "demo/src/tests"], function (require, exports, misc_5, control_2, tests_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.perfTestPost = exports.perfTestGui = void 0;
    let started = 0;
    function perfTestGui() {
        (0, misc_5.mylog)('perftestgui', misc_5.config.tests);
        if (misc_5.config.tests > 0) {
            perfTestFast();
            return;
        }
        if (started) {
            (0, misc_5.mylog)('stop');
            started = 0;
            return;
        }
        started = Date.now();
        perfTestPost(-misc_5.config.tests);
    }
    exports.perfTestGui = perfTestGui;
    async function perfTestFast() {
        const resp = await (0, control_2.cacheFetch)(misc_5.config.baseurl + '/static/news.json');
        const data = await resp.json();
        const main = document.getElementById('main');
        main.innerHTML = 'perftest ' + misc_5.config.tests + ' ...';
        main.innerHTML = (0, tests_1.perfTest)(data);
    }
    async function perfTestPost(count) {
        if (!started)
            return;
        const main = document.getElementById('main');
        if (count > 0) {
            const resp = await (0, control_2.cacheFetch)('/myapi/ask/2');
            main.innerHTML = await resp.text();
            window.postMessage(count - 1, '*');
        }
        else {
            main.innerHTML = (0, tests_1.perfStr)(started);
            started = 0;
        }
    }
    exports.perfTestPost = perfTestPost;
});
define("demo/src/onevents", ["require", "exports", "demo/src/browser2", "demo/src/tests2"], function (require, exports, browser2_1, tests2_1) {
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
        (0, tests2_1.perfTestPost)(e.data);
    }
    function onPopState(e) {
        (0, browser2_1.fetchPaint)(e.state);
    }
    function onClick(e) {
        if (e.target instanceof HTMLAnchorElement) {
            const cmd = e.target.dataset.cmd;
            if (cmd !== undefined) {
                e.preventDefault();
                if (cmd === 'perftest')
                    return (0, tests2_1.perfTestGui)();
                const path = cmd || e.target.pathname;
                window.history.pushState(path, '');
                document.forms[0].reset();
                (0, browser2_1.fetchPaint)(path);
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
                (0, browser2_1.fetchPaint)(path);
            }
        }
    }
});
define("demo/src/browser", ["require", "exports", "demo/src/misc", "demo/src/browser2", "demo/src/onevents", "demo/src/view"], function (require, exports, misc_6, browser2_2, onevents_1, view_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.browser = void 0;
    function browser() {
        (0, misc_6.mylog)('browser');
        const nav = document.getElementById('nav');
        nav.className = 'other';
        if (!('fetch' in window)) {
            showFail('Browser not supported.', 'Missing fetch.');
            return;
        }
        const query = window.location.search;
        const args = query ? query.substring(1).split('&') : [];
        const config = (0, misc_6.updateConfig)(args);
        const main = document.getElementById('main');
        if (!main.firstElementChild)
            (0, browser2_2.fetchPaint)();
        (0, onevents_1.setupHandlers)();
        if (!config.tests)
            startWorker(true);
    }
    exports.browser = browser;
    function showFail(summary, reason) {
        (0, misc_6.mylog)('fail:', summary, reason);
        const details = reason +
            '<br><br>Ensure cookies are enabled, the connection is secure,' +
            ' the browser is not in private mode and is supported' +
            ' (Chrome on Android, Safari on iOS).';
        const error = document.getElementById('error');
        error.outerHTML = (0, view_4.renderToMarkup)(details, 'error', summary);
    }
    function startWorker(service) {
        const script = 'sw.js';
        if (service) {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register(script)
                    .then(reg => { (0, misc_6.mylog)(reg); (0, browser2_2.setWorker)(); }, err => { showFail('Service Worker failed.', err); startWorker(); });
            }
            else {
                showFail('Service Worker not supported.', '');
                startWorker();
            }
        }
        else {
            if (window.Worker) {
                (0, browser2_2.setWorker)(new Worker(script));
            }
            else {
                showFail('Worker not supported.', '');
            }
        }
    }
});
define("demo/src/nodejs", ["require", "exports", "fs", "http", "https", "demo/src/misc", "demo/src/server", "demo/src/view", "demo/src/tests"], function (require, exports, fs, http, https, misc_7, server_3, view_5, tests_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nodejs = void 0;
    ;
    function nodejs() {
        (0, misc_7.mylog)('nodejs');
        const config = (0, misc_7.updateConfig)(process.argv.slice(2), { worker: 'node' });
        if (config.tests)
            doTests(config.tests);
        else
            doServer(config.port);
    }
    exports.nodejs = nodejs;
    function doTests(numTests) {
        (0, tests_2.tests)();
        if (numTests == 1)
            return;
        const news = fs.readFileSync('public/static/news.json', 'utf8');
        const json = JSON.parse(news);
        (0, tests_2.perfTest)(json);
    }
    function doServer(port) {
        const server = http.createServer(onRequest).listen(port);
        (0, misc_7.mylog)('listening', server.address());
    }
    async function onRequest(req, res) {
        try {
            const resp = await doGet('' + req.url);
            res.writeHead(resp.status, resp.statusText, resp.headers);
            res.write(resp.body);
        }
        catch (err) {
            res.statusCode = 500;
            res.statusMessage = '' + err;
        }
        res.end();
    }
    function doGet(path) {
        (0, misc_7.mylog)('doGet', path);
        if (path.startsWith('/myapi/'))
            return doApi(path);
        path = (0, server_3.modFilePath)(path);
        if (path.startsWith('/public/'))
            return doFile('.' + path);
        return (0, server_3.otherResp)(path);
    }
    function doFile(path) {
        return new Promise((resolve, reject) => {
            fs.readFile(path, null, (err, data) => {
                if (err)
                    (0, misc_7.mylog)(err.message);
                resolve((0, server_3.fileResp)(path, data));
            });
        });
    }
    async function doApi(path) {
        const { cmd, arg, url } = (0, misc_7.path2cmd)(path);
        const resp = await httpsGet(url);
        if (resp.status === 200) {
            const json = JSON.parse(resp.body);
            const data = !json ? 'No data' : json.error ? json.error.toString() : json;
            const html = (0, view_5.renderToMarkup)(data, cmd, arg);
            resp.headers = (0, server_3.newHeaders)(600, 'text/html', html.length);
            resp.body = html;
        }
        return resp;
    }
    function httpsGet(url) {
        return new Promise((resolve, reject) => {
            https.get(url, res => {
                const resp = {
                    status: res.statusCode || 500,
                    statusText: res.statusMessage,
                    headers: res.headers,
                    body: '',
                };
                res.on('data', chunk => resp.body += chunk);
                res.on('end', () => resolve(resp));
            })
                .on('error', err => reject(err.message));
        });
    }
});
define("demo/src/worker", ["require", "exports", "demo/src/misc", "demo/src/control", "demo/src/server", "dist/indexes"], function (require, exports, misc_8, control_3, server_4, indexes_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cfworker = exports.sworker = exports.worker = void 0;
    const PRE_CACHE = ['index.html',
        'main.js',
        'static/app.css',
        'static/intro.html',
        'static/manifest.json',
        'static/favicon-32.png',
        'static/favicon-256.png'
    ];
    function worker() {
        (0, misc_8.mylog)('worker');
        (0, misc_8.updateConfig)([], { baseurl: '/public/', worker: 'web' });
        (0, control_3.enableCache)();
        self.addEventListener('message', onMessage);
    }
    exports.worker = worker;
    function sworker() {
        (0, misc_8.mylog)('sworker');
        (0, misc_8.updateConfig)([], { baseurl: '/public/', worker: 'service' });
        (0, control_3.enableCache)();
        self.addEventListener('install', onInstall);
        self.addEventListener('activate', onActivate);
        self.addEventListener('fetch', onFetch);
    }
    exports.sworker = sworker;
    function cfworker() {
        (0, misc_8.mylog)('cfworker');
        const config = (0, misc_8.updateConfig)(self, { worker: 'cf' });
        (0, control_3.enableCache)();
        self.addEventListener('fetch', onFetch);
    }
    exports.cfworker = cfworker;
    function onInstall(e) {
        (0, misc_8.mylog)('onInstall', e);
        e.waitUntil(preCache());
    }
    function onActivate(e) {
        (0, misc_8.mylog)('onActivate', e);
        e.waitUntil(deleteOld());
    }
    function onFetch(e) {
        e.respondWith((0, control_3.cacheFetch)(e.request, e));
    }
    async function onMessage(e) {
        const resp = await (0, control_3.cacheFetch)(e.data);
        const html = await resp.text();
        postMessage(html);
    }
    async function preCache() {
        (0, misc_8.mylog)('preCache', PRE_CACHE);
        const cache = await caches.open(misc_8.version);
        await cache.addAll(PRE_CACHE);
        const resp = await cache.match('index.html');
        const index = await resp.text();
        const html = indexes_2.indexes.join('');
        await cache.put('./', (0, server_4.htmlResp)(html, server_4.STATIC_TTL));
        await self.skipWaiting();
    }
    async function deleteOld() {
        (0, misc_8.mylog)('deleteOld', misc_8.version);
        await self.clients.claim();
        const keys = await caches.keys();
        const keys2 = keys.filter(key => key !== misc_8.version);
        await Promise.all(keys2.map(name => caches.delete(name)));
    }
});
define("demo/src/main", ["require", "exports", "demo/src/misc", "demo/src/nodejs", "demo/src/browser", "demo/src/worker"], function (require, exports, misc_9, nodejs_1, browser_1, worker_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    main();
    function main() {
        (0, misc_9.mylog)('main', misc_9.version);
        if ('Deno' in globalThis)
            (0, misc_9.mylog)('Deno not supported');
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
