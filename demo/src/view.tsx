/*
  JSX to render the dynamic part of the UI.
*/
export { renderToMarkup }
import { getIndexes } from './indexes';
import { config, mylog, resetLog } from './misc';
import { h, renderToStaticMarkup } from '../../src/jsxrender';
import type { HnUser, HnComment, HnItem } from './model';
import type { HnSearchResults, HnSearchItem } from './model';

function renderToMarkup(data: any, cmd: string, arg: string) {
  const vnode = renderToJSX(data, cmd, arg);
  const str = renderToStaticMarkup(vnode as any);
  const indexes = getIndexes();
  return indexes ? indexes[0] + cmd + indexes[1] + str + indexes[2] : str;
}

function renderToJSX(data: any, cmd: string, arg: string) {
  switch(cmd) {
    case '':
    case 'error': return MsgView(data, arg, cmd);
    case 'user': return UserView({ user: data });
    case 'item': return ItemView({ item: data });
    case 'search': return SearchesView({ res: data });
  }
  return ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
}

function SearchesView(props: { res: HnSearchResults }) {
  const props2 = {
    items: props.res.hits,
    cmd: 'search',
    page: props.res.page + 1,
    pageSize: props.res.hitsPerPage,
    query: props.res.query,
  };
  return ItemsView(props2);
}

function ItemsView(props: { items: HnItem[] | HnSearchItem[], cmd: string,
    page: number, pageSize?: number }) {
  const size = props.pageSize || 30;
  return (
    <div>
      <ol start={(props.page - 1) * size + 1} className='ol'>
        {props.items.map(item => <li className='li'><ItemView item={item}/></li>)}
      </ol>
      {props.cmd !== 'search' && PagerView(props)}
    </div>
  );
}

function ItemView(props: { item: HnItem | HnSearchItem}) {
  const i: Partial<HnItem> & Partial<HnSearchItem> = props.item as any;
  const url = '/item/' + (i.id || i.objectID);
  const iurl = !i.url || i.url.startsWith('item?id=') ? url : i.url;
  const iuser = i.user || i.author;
  const icount = i.comments_count || i.num_comments;
  const idomain = i.domain || i.url?.split('/', 3)[2];
  const idate = i.time_ago || i.created_at?.substring(0, 10);

  const domain = idomain && <span className='smallgrey'>({idomain})</span>;
  const points = !!i.points && <span>{i.points} points</span>;
  const user = iuser && <span>by <UserNameView user={iuser}/></span>;
  const comments = !!icount &&
  <span>| <Link href={url} cmd>{icount} comments</Link></span>;
  return (
    <article className={i.comments && 'inset'}>
      <Link className='mainlink' href={iurl} cmd={!idomain}>{i.title}</Link> {domain}
      <div className='smallgrey'>
        {points} {user} {idate} {comments}
      </div>
      {i.content && <p/>}
      {i.content}
      <CommentsView comments={i.comments}/>
    </article>
  );
}

function CommentsView(props: { comments?: HnComment[] }) {
  return !props.comments ? null : (
    <div>
      <p/>
      {props.comments.map(comment =>
      <CommentView comment={comment}/>)}
    </div>
  );
}

function CommentView(props: { comment: HnComment }): JSX.Element {
  const c = props.comment;
  return (
    <details className='details' open>
      <summary>
        <UserNameView user={c.user}/> {c.time_ago}
      </summary>
      {c.content}
      <CommentsView comments={c.comments}/>
    </details>
  );
}

function UserNameView(props: { user: string }) {
  return <Link className='bold' href={'/user/' + props.user} cmd>{props.user}</Link>;
}

const Y_URL = 'https://news.ycombinator.com/';

function UserView(props: { user: HnUser }) {
  const u = props.user;
  return (
    <div className='inset'>
      <p>
        user <span className='bold large'>{u.id} </span>
        ({u.karma}) created {u.created}
      </p>
      <div>{u.about}</div>
      <p>
        <a href={Y_URL + 'submitted?id=' + u.id}>submissions</a>
        <span> | </span>
        <a href={Y_URL + 'threads?id=' + u.id}>comments</a>
      </p>
    </div>
  );
}

let color = 0;

function PagerView(props: { cmd: string, page: number }) {
  const nolink = props.page > 1 ? undefined : 'nolink';
  const prev = <Link href={`/${props.cmd}/${props.page - 1}`} cmd
    className={nolink}>&larr; prev</Link>;
  const next = <Link href={`/${props.cmd}/${props.page + 1}`} cmd
    prefetch={!config.tests}>next &rarr;</Link>;
  const style = config.tests ? `color:hsl(${++color},100%,50%)` : 'pointer-events:none';
  const page = <a style={style as any} data-cmd='perftest'>page {props.page}</a>;
  return (
    <div className='pager'>
      {prev} {page} {next} <LogsView/>
    </div>
  );
}

function LogsView() {
  const logs = resetLog();
  return logs.length === 0 ? null : (
    <details>
      <summary>Logs</summary>
      <pre>{logs.join('\n')}</pre>
    </details>
  );
}

function Link(props: { href: string, className?: string,
    cmd?: boolean, prefetch?: boolean, children: any }) {
  const href = (props.cmd ? '/myapi' : '') + props.href;
  const target = props.cmd ? '_self' : undefined;
  const prefetch = props.prefetch ? <link rel='prefetch' href={href}/> : undefined;
  const a = <a href={href} className={props.className}
    target={target} data-cmd={props.cmd}>{props.children}</a>
  return props.prefetch ? <span>{prefetch}{a}</span> : a;
}

function MsgView(details: string, summary: string, className: string) {
  return (
    <details open={!summary} className={className}>
      <summary>{summary || 'Error'}</summary>
      {details}
    </details>
  );
}
