export { h, h as createElement, jsx, jsx as jsxs, Fragment, renderToStaticMarkup };
declare type Mapped = {
    [key: string]: unknown;
};
declare type Props = Mapped & {
    children?: NodeType;
};
declare type NodeType = NodeType[] | string | number | boolean | null | undefined;
declare type ElementType = string;
declare function h(type: string | Function, props?: Props | null, ...children: NodeType[]): ElementType;
declare function jsx(type: string | Function, props: Props, key?: unknown): ElementType;
declare function Fragment(props: Props): ElementType;
declare function renderToStaticMarkup(element: ElementType): string;
