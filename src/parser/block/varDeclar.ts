import { TokenStream } from "../../lexer/token.js"
import { type Node } from "../utility"

export function generateVariableDeclaration(context: Node, tokens: TokenStream): VariableDeclaration | MismatchToken {
    const variableDeclaration: VariableDeclaration = {
        type: "VariableDeclaration",
        declarations: [],
        kind: "var",
        signature: null,
        start: 0,
        end: 0
    }

    return variableDeclaration as VariableDeclaration
}