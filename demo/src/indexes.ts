/*
  handles index.html
*/
export { getIndexes, getIndexHtml, setIndexHtml };

let indexes: string[] | undefined;

function getIndexes() {
  return indexes;
}

function getIndexHtml() {
  return indexes![0] + indexes![1] + indexes![2];
}

function setIndexHtml(text: string) {
  indexes = splitIndexMain(text);
}

function splitIndexMain(text: string) {
  if(!text) return;
  const nav = '<nav id="nav" class="">';
  const pos0 = text.indexOf(nav) + nav.length - 2;
  const main = '<main id="main">';
  const pos1 = text.indexOf(main) + main.length;
  const pos2 = text.indexOf('</main>', pos1);
  return [ text.substring(0, pos0), text.substring(pos0, pos1),
    text.substring(pos2) ];
}
