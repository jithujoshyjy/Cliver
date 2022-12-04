import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility"

export function generateIdentifier(context: Node, tokens: TokenStream): Identifier | MismatchToken {
    const identifier: Identifier = {
        type: "Identifier",
        name: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    
    if (currentToken.type != TokenType.Identifier) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    identifier.name = currentToken.value as string

    return identifier
}