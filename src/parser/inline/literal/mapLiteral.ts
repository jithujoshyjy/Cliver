import { Token, TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, skipables, type Node } from "../../utility"
import { generatePair } from "../term/pair.js"

export function generateMapLiteral(context: Node, tokens: TokenStream): MapLiteral | MismatchToken {
    const mapLiteral: MapLiteral = {
        type: "MapLiteral",
        elements: [],
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    const currentToken = tokens.currentToken
    const values = currentToken.value as Token[]
    const invalidStartTokens = [
        TokenType.Keyword,
        TokenType.Operator,
        TokenType.Punctuator,
        TokenType.BraceEnclosed
    ]

    for (let value of values) {
        if (skipables.includes(value.type))
            continue

        if (invalidStartTokens.includes(value.type)) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        generatePair(context, tokens)
    }

    return mapLiteral as MapLiteral
}