export { h, h as createElement, Fragment, render, renderToStaticMarkup };
declare type Props = {
    [key: string]: any;
};
declare type NodeTypeBase = string | number | boolean | VNode | null | undefined;
declare type NodeType = NodeTypeBase | NodeTypeBase[];
interface VNode {
    type?: string;
    props: Props;
    children?: NodeType[];
    markup?: string;
}
declare function h(type: string | Function, props: Props | null, ...children: NodeType[]): VNode;
declare function Fragment(props: Props): VNode;
declare function render(element: VNode, container: Element): void;
declare function renderToStaticMarkup(element: VNode): string;
