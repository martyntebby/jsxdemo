/*
  Creates public/index.html with stylesheet and script replaced with file contents.
*/
import * as fs from 'fs';
import * as process from 'process';

const regex = /<!--include="([^ ]+)"-->|<link rel="stylesheet" href="([^ ]+)"\/>|<script src="([^ ]+)"><\/script>/g;
const encoding = 'utf8';

main();

function main() {
  const inFile = process.argv[2] || 'demo/index.html';
  const outFile = process.argv[3] || 'public/index.html';
  const inStr = fs.readFileSync(inFile, encoding);
  const outStr = inStr.replace(regex, replacer);
  fs.writeFileSync(outFile, outStr, encoding);
}

function replacer(substring: string, include: string, href: string, src: string) {
  const tag = include ? 'div' : href ? 'style' : 'script';
  const file = '.' + (include || href || src);
  const text = fs.readFileSync(file, encoding);
  return `<${tag}>\n${text}</${tag}>`;
}
