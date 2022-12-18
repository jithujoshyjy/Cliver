import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"

export function generateBracketPattern(context: Node, tokens: TokenStream): BracketPattern | MismatchToken {
    const bracketPattern: BracketPattern = {
        type: "BracketPattern",
        values: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    return bracketPattern
}