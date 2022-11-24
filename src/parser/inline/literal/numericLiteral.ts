import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility"

export function generateNumericLiteral(context: Node, tokens: TokenStream): NumericLiteral | MismatchToken {
    const numericLiteral = {
        type: "NumericLiteral",
        value: null,
        start: 0,
        end: 0
    }

    return numericLiteral as unknown as NumericLiteral
}