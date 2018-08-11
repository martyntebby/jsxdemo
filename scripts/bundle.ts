import * as fs from 'fs';
import * as process from 'process';

const regex = /<link rel="stylesheet" href="([^ ]+)"\/>|<script src="([^ ]+)"><\/script>/g;
const encoding = 'utf8';

main();

function main() {
  const inFile = process.argv[2] || 'index.html';
  const outFile = process.argv[3] || '../dist/index.html';
  const inStr = fs.readFileSync(inFile, encoding);
  const outStr = inStr.replace(regex, replacer);
  fs.writeFileSync(outFile, outStr, encoding);
}

function replacer(substring: string, arg1: string, arg2: string) {
  const tag = arg1 ? 'style' : 'script';
  const text = fs.readFileSync(arg1 || arg2, encoding);
  return `<${tag}>\n${text}</${tag}>`;
}
