/*
  Creates public/index.html with stylesheet and script replaced with file contents.
*/
import * as fs from 'fs';
import * as process from 'process';

const regex = /<link rel="stylesheet" href="([^ ]+)"\/>|<script src="([^ ]+)"><\/script>/g;
const encoding = 'utf8';

main();

function main() {
  const inFile = process.argv[2] || 'index.html';
  const outFile = process.argv[3] || '../public/index.html';
  const inStr = fs.readFileSync(inFile, encoding);
  const outStr = inStr.replace(regex, replacer);
  fs.writeFileSync(outFile, outStr, encoding);
}

function replacer(substring: string, href: string, src: string) {
  const tag = href ? 'style' : 'script';
  const text = fs.readFileSync(href || src, encoding);
  return `<${tag}>\n${text}</${tag}>`;
}
