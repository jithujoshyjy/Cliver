import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility.js"

export function generateIfInline(context: Node, tokens: TokenStream): IfInline | MismatchToken {
    const ifInline = {
        type: "MatchInline",
        alternate: null,
        body: null,
        condition: null,
        start: 0,
        end: 0
    }

    return ifInline as unknown as IfInline
}