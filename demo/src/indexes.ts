/*
  handles index.html
*/
export { getIndexes, getIndexHtml, setIndexHtml, setIndexResp };

const EMPTY_INDEXES = ['index not set'];
let indexes: Promise<string[]> | string[] = EMPTY_INDEXES;

async function getIndexes() {
  return await indexes;
}

async function getIndexHtml() {
  const indexes = await getIndexes();
  return indexes.length > 1 ? indexes[0] + indexes[1] + indexes[2] : '';
}

function setIndexHtml(text: string) {
  return indexes = splitIndexMain(text);
}

function splitIndexMain(text: string) {
  if(!text) return EMPTY_INDEXES;
  const nav = '<nav id="nav" class="">';
  const pos0 = text.indexOf(nav) + nav.length - 2;
  const main = '<main id="main">';
  const pos1 = text.indexOf(main) + main.length;
  const pos2 = text.indexOf('</main>', pos1);
  return [ text.substring(0, pos0), text.substring(pos0, pos1),
    text.substring(pos2) ];
}

function setIndexResp(respp: Promise<Response>) {
  indexes = setIndexResp2(respp);
}

async function setIndexResp2(respp: Promise<Response>) {
  const resp = await respp;
  const index = resp.ok ? await resp.text() : '';
  return setIndexHtml(index);
}
