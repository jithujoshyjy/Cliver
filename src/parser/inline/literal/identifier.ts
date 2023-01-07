import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility.js"

export function generateIdentifier(context: Node, tokens: TokenStream): Identifier | MismatchToken {
    const identifier: Identifier = {
        type: "Identifier",
        name: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if (currentToken.type != "Word") {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    identifier.name = currentToken.value
    identifier.start = currentToken.start
    identifier.end = currentToken.end

    tokens.advance()
    while (!tokens.isFinished) {
        currentToken = tokens.currentToken
        if (!["Integer", "Word"].includes(currentToken.type))
            break

        identifier.name += currentToken.value
        identifier.end = currentToken.end
        tokens.advance()
    }

    return identifier
}