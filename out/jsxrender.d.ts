export { h, h as createElement, Fragment, render, renderToStaticMarkup };
declare type Props = {
    [key: string]: any;
};
declare type NodeType = string | number | boolean | NodeType[] | null | undefined;
declare type ElementType = string;
declare function h(type: string | Function, props: Props | null, ...children: NodeType[]): ElementType;
declare function Fragment(props: Props): string;
declare function render(element: ElementType, container: Element): void;
declare function renderToStaticMarkup(element: ElementType): string;
