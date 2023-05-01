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
  write2(outStr);
}

function replacer(substring: string, include: string, href: string, src: string) {
  const tag = include ? 'div' : href ? 'style' : 'script';
  const file = '.' + (include || href || src);
  const text = fs.readFileSync(file, encoding);
  return `<${tag}>\n${text}</${tag}>`;
}

function write2(text: string) {
  const outFile = process.argv[4] || 'dist/indexes.ts';
  const nav = '<nav id="nav" class="">';
  const pos0 = text.indexOf(nav) + nav.length - 2;
  const main = '<main id="main">';
  const pos1 = text.indexOf(main, pos0) + main.length;
  const pos2 = text.indexOf('</main>', pos1);
  const outStr = `
export { indexes };
const indexes = [
\`
${text.substring(0, pos0)}
\`,\`
${text.substring(pos0, pos1)}
\`,\`
${text.substring(pos2)}
\`
];
`;
  fs.writeFileSync(outFile, outStr, encoding);
}
