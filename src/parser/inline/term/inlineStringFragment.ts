import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { skipables, type Node } from "../../utility"

export function generateInlineStringFragment(context: Node, tokens: TokenStream): InlineStringFragment | MismatchToken {
    const taggedString: InlineStringFragment = {
        type: "InlineStringFragment",
        fragments: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    return taggedString as unknown as InlineStringFragment
}