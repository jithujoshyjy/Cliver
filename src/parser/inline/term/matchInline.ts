import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility.js"

export function generateMatchInline(context: Node, tokens: TokenStream): MatchInline | MismatchToken {
    const matchInline = {
        type: "MatchInline",
        cases: [],
        condition: null,
        start: 0,
        end: 0
    }

    return matchInline as unknown as MatchInline
}