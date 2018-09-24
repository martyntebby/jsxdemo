JSX Render
----------
A stateless subset of React that just handles rendering.
No state management, change tracking nor event handlers.

It is small (~100 loc), designed for fast initial page load,
and also for server side rendering using isomorphic code.

It is written in typescript and useable with the React @type files
(see package.json).
The generated file dist/jsxrender.js can also be used with regular javascript.

Hacker News Demo
----------------
A simple Hacker News demo app using jsxrender.
It is based on [https://hnpwa.com], using a service worker and app shell.

Build
-----
npm install

npm run build

npm test

Performance
-----------
Taken from webpagetest.org on a Moto 4G.

Lighthouse: 100/100

Interactive (slow 3G): 2.3s (1st view), 0.3s (repeat)

Interactive (regular 3G): 1.8s (1st view), 0.3s (repeat)

Try it
------
[https://cdn.rawgit.com/martyntebby/jsxrender/0.8.2/dist/]

[https://rawcdn.githack.com/martyntebby/jsxrender/0.8.2/dist/]
