import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility"

export function generateIdentifier(context: Node, tokens: TokenStream): Identifier | MismatchToken {
    const identifier: Identifier = {
        type: "Identifier",
        name: "",
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor

    let currentToken = tokens.currentToken
    if (currentToken.type != TokenType.Identifier) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    identifier.name = currentToken.value as string
    identifier.start = currentToken.line
    identifier.end = currentToken.column

    return identifier
}