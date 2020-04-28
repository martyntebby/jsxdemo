import * as ts from 'typescript';

export default function(program: ts.Program, pluginOptions: {}) {
//    console.log('export default function');
    return (ctx: ts.TransformationContext) => {
        console.log('ctx =>');
        return (sourceFile: ts.SourceFile) => {
            console.log('sourceFile =>', sourceFile.fileName);
            function visitor(node: ts.Node): ts.Node {
                if(node.kind === ts.SyntaxKind.JsxText ||
                    (node.kind >= ts.SyntaxKind.JsxElement && node.kind <= ts.SyntaxKind.JsxExpression)) {
                    console.log('visitor', node.kind, node.getText());
                    console.log(node);
                }
                // if (ts.isCallExpression(node)) {
                //     return ts.createLiteral('call');
                // }
                return ts.visitEachChild(node, visitor, ctx);
            }
            return ts.visitEachChild(sourceFile, visitor, ctx);
        };
    };
}
