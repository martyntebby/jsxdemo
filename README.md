JSX Render
----------
A stateless subset of React that just handles rendering.
No state management, change tracking nor event handlers.

It is small (~100 loc), designed for fast initial page load,
and also for server side rendering using isomorphic code.

It is written in typescript and useable with the React @type files
(see package.json).

[jsxrender](https://github.com/martyntebby/jsxrender)

Hacker News Demo
----------------
A simple Hacker News demo app using jsxrender.
It is based on [hnpwa.com](https://hnpwa.com), using a service worker and app shell.

Build
-----
npm install

npm run build

npm test

Performance
-----------
Taken from webpagetest.org on a Moto G4.

Lighthouse: 100/100

Interactive (LTE): 1.1s

Interactive (fast 3G): 1.4s

Interactive (slow 3G): 2.4s

Try it
------
[westinca.com](https://jsxdemo.westinca.com/public/)
