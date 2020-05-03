"use strict";
define("demo/src/control", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function link2cmd(pathname, prePathLen, state) {
        state = state || {};
        const strs = pathname.substring(prePathLen).split('/');
        if (strs[1] === 'index.html')
            strs[1] = '';
        const cmd = state.cmd || strs[1] || 'news';
        const arg = state.arg || strs[2] || '1';
        const url = cmd2url(cmd, arg);
        return { cmd, arg, url };
    }
    exports.link2cmd = link2cmd;
    function cmd2url(cmd, arg) {
        return cmd === 'newest'
            ? `https://node-hnapi.herokuapp.com/${cmd}?page=${arg}`
            : `https://api.hnpwa.com/v0/${cmd}/${arg}.json`;
    }
});
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
    function render(element, container) {
        container.innerHTML = renderToStaticMarkup(element);
    }
    exports.render = render;
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
define("demo/src/view", ["require", "exports", "src/jsxrender"], function (require, exports, jsxrender_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        return (jsxrender_1.h("div", null,
            props.comments && jsxrender_1.h("p", null),
            props.comments && props.comments.map(comment => jsxrender_1.h(CommentView, { comment: comment }))));
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
            next));
    }
    function ErrorView(err) {
        return jsxrender_1.h("div", { className: 'error' },
            "Error: ",
            err);
    }
});
define("demo/src/nodejs", ["require", "exports", "fs", "http", "https", "demo/src/control", "demo/src/view"], function (require, exports, fs, http, https, control_1, view_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let indexHtmlStr = '';
    let mainPos = 0;
    function nodejs() {
        const port = 3000;
        console.log('nodejs', port);
        indexHtmlStr = fs.readFileSync('dist/index.html', 'utf8');
        mainPos = indexHtmlStr.indexOf('</main>');
        http.createServer(serverRequest).listen(port);
    }
    exports.nodejs = nodejs;
    function serverRequest(req, res) {
        console.log('serverRequest', req.url);
        if (!req.url)
            return;
        // should handle with nginx
        if (req.url.startsWith('/demo/') || req.url.startsWith('/dist/')) {
            fs.readFile('.' + req.url, 'utf8', (err, data) => {
                if (err)
                    console.log(err.message);
                res.statusCode = 200;
                res.end(data);
            });
            return;
        }
        const { cmd, arg, url } = control_1.link2cmd(req.url, 0);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');
        res.write(indexHtmlStr.substring(0, mainPos));
        function sendResp(data) {
            res.write(view_1.renderToMarkup(cmd, arg, data));
            res.end(indexHtmlStr.substring(mainPos));
        }
        https.get(url, res2 => {
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
        }).on('error', err => {
            sendResp(err.message);
        });
    }
});
define("demo/src/main", ["require", "exports", "demo/src/nodejs", "demo/src/control", "demo/src/view"], function (require, exports, nodejs_1, control_2, view_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let prepath;
    main();
    function main() {
        mylog('main');
        typeof process === 'object' && process.version ? nodejs_1.nodejs() : browser();
    }
    function browser() {
        mylog('browser');
        const path = document.location.pathname;
        let pos = path.search(/\/(dist|demo)\//);
        pos = pos > -1 ? pos + 5 : path.lastIndexOf('/');
        prepath = path.substring(0, pos);
        mylog('prepath', prepath);
        const main = document.getElementById('main');
        if (!('fetch' in window)) {
            main.innerHTML = view_2.renderToMarkup('', '', 'Requires modern browser.');
            return;
        }
        if (!main.firstElementChild) {
            clientRequest(path);
        }
        window.onpopstate = onPopState;
        document.body.onclick = onClick;
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('../dist/sw.js')
                .then(reg => mylog(reg));
        }
    }
    function onPopState(e) {
        clientRequest(document.location.pathname, e.state);
    }
    function onClick(e) {
        if (e.target instanceof HTMLAnchorElement && e.target.dataset.cmd != null) {
            clientRequest(prepath + e.target.pathname, null, true);
            e.preventDefault();
        }
    }
    async function clientRequest(path, state, push) {
        mylog('clientRequest', path, state);
        const { cmd, arg, url } = control_2.link2cmd(path, prepath.length, state);
        const datap = clientFetch(url);
        if (push)
            window.history.pushState({ cmd, arg }, '');
        const nav = document.getElementById('nav');
        nav.className = cmd;
        const main = document.getElementById('main');
        const child = main.firstElementChild;
        if (child)
            child.className = 'loading';
        const html = view_2.renderToMarkup(cmd, arg, await datap);
        main.innerHTML = html;
        window.scroll(0, 0);
    }
    async function clientFetch(url) {
        try {
            const resp = await fetch(url);
            if (!resp.ok)
                return resp.statusText;
            const json = await resp.json();
            return !json ? 'No data' : json.error ? json.error.toString() : json;
        }
        catch (err) {
            return err.toString();
        }
    }
    function mylog(...args) {
        console.log(...args);
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
