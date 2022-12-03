import { TokenStream } from "../../../lexer/token.js"
import { type Node } from "../../utility.js"

export function generateMatchInline(context: Node, tokens: TokenStream): MatchInline | MismatchToken {
    const matchInline = {
        type: "MatchInline",
        cases: [],
        condition: null,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return matchInline as unknown as MatchInline
}