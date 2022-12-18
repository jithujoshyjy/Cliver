import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, isPunctuator, type Node } from "../../../utility.js"

export function generateBracePattern(context: Node, tokens: TokenStream): BracePattern | MismatchToken {
    const bracePattern: BracePattern = {
        type: "BracePattern",
        values: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(currentToken.type != TokenType.BraceEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    bracePattern.start = currentToken.start
    bracePattern.end = currentToken.end

    const braceTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = braceTokens.currentToken

    const captureComma = () => {
        currentToken = braceTokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    

    return bracePattern
}