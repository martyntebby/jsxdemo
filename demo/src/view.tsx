/*
  JSX to render the dynamic part of the UI.
*/
export { mylog, renderToMarkup }
import { h, renderToStaticMarkup } from '../../src/jsxrender';
import { config } from '../../package.json';
import type { HnUser, HnComment, HnItem } from './model';

let logs: string[] = [];

function mylog(...args: any[]) {
  console.log(...args);
  if(config.dolog) logs.push(Date.now() + '  ' + args.join('  '));
}

function renderToMarkup(cmd: string, arg: string, data: any) {
  const vnode = typeof data === 'string' ? ErrorView(data, arg) :
  cmd === 'user' ? UserView({ user: data }) :
  cmd === 'item' ? ItemView({ item: data }) :
  ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
  return renderToStaticMarkup(vnode as any);
}

function ItemsView(props: { items: HnItem[], cmd: string, page: number }) {
  return (
    <div>
      <ol start={(props.page - 1) * 30 + 1} className='ol'>
        {props.items.map(item => <li className='li'><ItemView item={item}/></li>)}
      </ol>
      {PagerView(props)}
    </div>
  );
}

function ItemView(props: { item: HnItem }) {
  const i = props.item;
  const url = i.domain ? i.url : '/' + i.url.replace('?id=', '/');
  const domain = i.domain && <span className='smallgrey'>({i.domain})</span>;
  const points = i.points > 0 && <span>{i.points} points</span>;
  const user = i.user && <span>by <UserNameView user={i.user}/></span>;
  const comments = i.comments_count > 0 &&
  <span>| <Link href={'/item/' + i.id} cmd>{i.comments_count} comments</Link></span>;
  return (
    <article className={i.comments && 'inset'}>
      <Link className='mainlink' href={url} cmd={!i.domain}>{i.title}</Link> {domain}
      <div className='smallgrey'>
        {points} {user} {i.time_ago} {comments}
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
    prefetch={!config.perftest}>next &rarr;</Link>;
  const style = config.perftest ? `color:hsl(${++color},100%,50%)` : 'pointer-events:none';
  const page = <a style={style as any} data-cmd='perftest'>page {props.page}</a>;
  return (
    <div className='pager'>
      {prev} {page} {next} <LogsView/>
    </div>
  );
}

function LogsView() {
  return logs.length === 0 ? null : (
    <details>
      <summary>Logs</summary>
      <pre>{logs.join('\n')}</pre>
      {logs = []}
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

function ErrorView(err: string, summary?: string) {
  const open = !summary;
  summary = summary || 'Error';
  return <details open={open} className='error'><summary>{summary}</summary>{err}</details>;
}
