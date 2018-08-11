"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var process = __importStar(require("process"));
var regex = /<link rel="stylesheet" href="([^ ]+)"\/>|<script src="([^ ]+)"><\/script>/g;
var encoding = 'utf8';
main();
function main() {
    var inFile = process.argv[2] || 'index.html';
    var outFile = process.argv[3] || '../dist/index.html';
    var inStr = fs.readFileSync(inFile, encoding);
    var outStr = inStr.replace(regex, replacer);
    fs.writeFileSync(outFile, outStr, encoding);
}
function replacer(substring, arg1, arg2) {
    var tag = arg1 ? 'style' : 'script';
    var text = fs.readFileSync(arg1 || arg2, encoding);
    return "<" + tag + ">\n" + text + "</" + tag + ">";
}
