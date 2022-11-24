import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateTupleLiteral(context: Node, tokens: TokenStream): TupleLiteral | MismatchToken {
    const tupleLiteral = {
        type: "TupleLiteral",
        elements: [],
        start: 0,
        end: 0
    }

    return tupleLiteral as TupleLiteral
}