/// <reference types="react" />
export { render, renderToStaticMarkup, createElement, h, Fragment };
declare type Props = {
    [key: string]: any;
};
declare type NodeType = string | number | boolean | VNode | null | undefined;
interface VNode {
    type?: string;
    props: Props;
    children?: NodeType[];
}
declare function render(element: VNode, container: Element): void;
declare function renderToStaticMarkup(element: VNode | JSX.Element): string;
declare function createElement(type: string | Function, props: Props | null, ...children: NodeType[]): VNode;
declare const h: typeof createElement;
declare function Fragment(props: Props): VNode;
