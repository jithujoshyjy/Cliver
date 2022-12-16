import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, skip, skipables, type Node } from "../../utility.js"
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

    mapLiteral.start = currentToken.start
    mapLiteral.end = currentToken.end
    
    const captureComma = () => {
        currentToken = braceTokens.currentToken

        if (!isPunctuator(currentToken, ",")) {
            return createMismatchToken(currentToken)
        }

        return currentToken
    }
    
    const braceTokens = new TokenStream(currentToken.value as Array<typeof currentToken>)
    currentToken = braceTokens.currentToken

    const parsePair = () => {

        if (skipables.includes(currentToken.type) || isPunctuator(currentToken, ","))
            currentToken = skip(braceTokens, skipables)

        let pair: Pair | MismatchToken = generatePair(mapLiteral, braceTokens)
        currentToken = braceTokens.currentToken

        return pair
    }

    while (!braceTokens.isFinished) {

        if (braceTokens.currentToken.type == TokenType.EOF)
            break
        
        const pair = parsePair()

        if (pair.type == "MismatchToken" && pair.value.type == TokenType.EOF)
            break

        if (pair.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return pair
        }

        mapLiteral.pairs.push(pair)
        if (skipables.includes(currentToken.type))
            currentToken = skip(braceTokens, skipables)
        
        if (currentToken.type == TokenType.EOF)
            break
        
        const comma = captureComma()

        if (comma.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return comma
        }

        currentToken = braceTokens.currentToken
    }

    return mapLiteral
}