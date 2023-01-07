import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isOperator, isPunctuator, type Node } from "../../utility.js"

export function generateIdentifier(context: Node, tokens: TokenStream): Identifier | MismatchToken {
    const identifier: Identifier = {
        type: "Identifier",
        name: null!,
        start: 0,
        end: 0
    }
    
    let currentToken = tokens.currentToken
    let wordCount = 0
    const initialCursor = tokens.cursor

    if (isPunctuator(currentToken, "$")) {
        identifier.name += "$"
        identifier.start = currentToken.start
        identifier.end = currentToken.end

        tokens.advance()
    }
    else if (currentToken.type == "Word" && currentToken.value == "_") {
        identifier.name += "_"
        identifier.start = currentToken.start
        identifier.end = currentToken.end

        tokens.advance()
        currentToken = tokens.currentToken

        if (currentToken.type == "EOF") {
            tokens.cursor = initialCursor
            const error = `SyntaxError: Unexpected end of input on ${currentToken.line}:${currentToken.column}`
            return createMismatchToken(currentToken, error)
        }

        if (isPunctuator(currentToken, "$")) {
            identifier.name += "$"
            identifier.end = currentToken.end
            tokens.advance()
        }
    }
    else if (currentToken.type == "Word") {
        identifier.name += currentToken.value
        identifier.start = currentToken.start
        identifier.end = currentToken.end

        wordCount++
        tokens.advance()
    }
    else {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    currentToken = tokens.currentToken
    while (!tokens.isFinished && ["Word", "Integer"].includes(currentToken.type)) {

        identifier.name += currentToken.value
        identifier.end = currentToken.end

        wordCount++
        tokens.advance()
        currentToken = tokens.currentToken
        if (currentToken.type == "EOF") break
    }

    if (wordCount) {
        if (isOperator(currentToken, "!")) {
            identifier.name += "!"
            identifier.end = currentToken.end

            tokens.advance()
            currentToken = tokens.currentToken
        }

        while (!tokens.isFinished && isPunctuator(currentToken, "'")) {
            identifier.name += "'"
            identifier.end = currentToken.end

            tokens.advance()
            currentToken = tokens.currentToken
            if (currentToken.type == "EOF") break
        }
    }
    else if (!/^_$/.test(identifier.name)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    return identifier
}