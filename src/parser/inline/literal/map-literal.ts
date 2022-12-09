import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, skip, skipables, type Node } from "../../utility.js"
import { generatePair } from "../term/pair.js"

export function generateMapLiteral(context: Node, tokens: TokenStream): MapLiteral | MismatchToken {
    const mapLiteral: MapLiteral = {
        type: "MapLiteral",
        pairs: [],
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(currentToken.type != TokenType.BraceEnclosed) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    const captureComma = () => {
        currentToken = skip(tokens, skipables)
        if (!isOperator(currentToken, ",")) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const braceTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)

    const parsePair = () => {
        currentToken = braceTokens.currentToken

        if (skipables.includes(currentToken.type) || isOperator(currentToken, ","))
            currentToken = skip(braceTokens, skipables)

        let pair: Pair | MismatchToken = generatePair(mapLiteral, tokens)

        return pair
    }

    while (!braceTokens.isFinished) {
        const pair = parsePair()

        if (pair.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return pair
        }

        mapLiteral.pairs.push(pair)
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }
    }

    // tokens.advance()
    return mapLiteral
}