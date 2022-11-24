import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateLiteral(context: Node, tokens: TokenStream): Literal | MismatchToken {
    const literal = {
        type: "Literal",
        value: null,
        start: 0,
        end: 0
    }

    return literal as unknown as Literal
}