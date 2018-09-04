import * as React from '../src/jsxrender';

let errs = 0;

tests();

function tests() {
  compare(<p></p>, '<p></p>');
  compare(<div/>, '<div></div>');
  compare(<a><div/></a>, '<a><div></div></a>');
  compare(<div key={1} ref='abc'/>, '<div></div>');
  compare(<span className='abc'/>, '<span class="abc"></span>');
  compare(<a href='abc'>link</a>, '<a href="abc">link</a>');
  compare(<script defer/>, '<script defer="true"></script>');
  compare(<script noModule={false}/>, '<script></script>');
  compare(<div style={{zIndex:1}}/>, '<div style="z-index:1;"></div>');
  compare(<><div/></>, '<div></div>');
  compare(<></>, '');
  compare(<>{null}</>, '');
  compare(<>{undefined}</>, '');
  compare(<>{false}</>, '');
  compare(<>{true}</>, '');
  compare(<>{{}}</>, '');
  compare(<>{{abc:1}}</>, ''); // check this
  compare(<>{0}</>, '0');
  compare(<>abc</>, 'abc');
  compare(<><div/><span/></>, '<div></div><span></span>');
  compare(<Details/>, '<details></details>');
  compare(<Details summary='abc'/>, '<details><summary>abc</summary></details>');
  compare(<Details><div>abc</div></Details>, '<details><div>abc</div></details>');
  console.log(errs ? errs + ' FAILED' : 'All OK');
}

function Details(props: { summary?: string, children?:any }) {
  return (
    <details>
      {props.summary && <summary>{props.summary}</summary>}
      {props.children}
    </details>
  )
}

function compare(vnode: JSX.Element, html: string) {
  const markup = React.renderToStaticMarkup(vnode);
  const result = markup === html;
  if(!result) ++errs;
  console.log(result ? 'OK' : 'FAIL: ' + markup, html, vnode);
}
