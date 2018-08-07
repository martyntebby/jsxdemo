//export { doRender };
//import { h, render } from './jsxrender.js';

function doRender(cmd: string, arg: string, data: any, elem: Element) {
  const vnode = typeof data === 'string' ? ErrorView(data) :
  cmd === 'user' ? UserView({ user: data }) :
  cmd === 'item' ? ItemView({ item: data }) :
  ItemsView({ items: data, cmd: cmd, page: Number.parseInt(arg) });
  render(vnode as any, elem);
}

function ItemsView(props: { items: HnItem[], cmd: string, page: number }) {
  return (
    <div>
      <ol start={(props.page - 1) * 30 + 1}>
        {props.items.map(item => <li><ItemView item={item}/></li>)}
      </ol>
      <a href={`/${props.cmd}/${props.page + 1}`} data-cmd>Next Page</a>
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
  <span>| <a href={'/item/' + i.id} data-cmd>{i.comments_count} comments</a></span>;
  return (
    <div>
      <a href={url} data-cmd={!i.domain}>{i.title}</a> {domain}
      <div className='smallgrey'>
        {points} {user} {i.time_ago} {comments}
      </div>
      <CommentsView comments={i.comments}/>
    </div>
  );
}

function CommentsView(props: {comments?: HnComment[]}) {
  return (
    <div>
      {props.comments && props.comments.map(comment =>
      <CommentView comment={comment}/>)}
    </div>
  );
}

function CommentView(props: { comment: HnComment }): JSX.Element {
  const c = props.comment;
  return (
    <details open>
      <summary>
        <UserNameView user={c.user}/> {c.time_ago}
      </summary>
      {c.content}
      <CommentsView comments={c.comments}/>
    </details>
  );
}

function UserNameView(props: { user: string}) {
  return <a className='bold' href={'/user/' + props.user} data-cmd>{props.user}</a>;
}

function UserView(props: { user: HnUser }) {
  const u = props.user;
  return (
    <table>
      <tbody>
        <tr><td>user:</td><td>{u.id}</td></tr>
        <tr><td>created:</td><td>{u.created}</td></tr>
        <tr><td>karma:</td><td>{u.karma}</td></tr>
        <tr><td>about:</td><td>{u.about}</td></tr>
      </tbody>
    </table>
  );
}

function ErrorView(err: string) {
  return <div>Error: {err}</div>;
}
