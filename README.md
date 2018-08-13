JSX Render
----------
A stateless subset of React that just handles rendering.
No state management, change tracking nor event handlers.

It is small (~60 loc), designed for fast initial page load,
and also for server side rendering.

It is written in typescript and useable with React @type files.
The generated javascript ([dist/jsxrender.js]) can also be used with webpack.

JSX Hacker News
---------------
A simple Hacker News demo app using jsxrender.
It is based on [https://hnpwa.com], using a service worker, application shell
and prefetching.

Build
-----
npm install

npm run build

Performance
-----------
Lighthouse: 100/100

Interactive (slow 3G): 2.1s (1st view), 0.5s (repeat)

Interactive (regular 3G): 1.6s (1st view), 0.5s (repeat)

Try it
------
[https://cdn.rawgit.com/martyntebby/jsx-hackernews/0.5/dist/]
