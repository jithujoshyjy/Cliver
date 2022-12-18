import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"

export function generateParenPattern(context: Node, tokens: TokenStream): ParenPattern | MismatchToken {
    const parenPattern: ParenPattern = {
        type: "ParenPattern",
        values: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    return parenPattern
}