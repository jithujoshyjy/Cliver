import { TokenStream } from "../../../lexer/token.js"
import { createDiagnosticMessage, createMismatchToken, DiagnosticMessage, isOperator, isPunctuator, keywords, PartialParse, type Node } from "../../utility.js"

export function generateIdentifier(context: string[], tokens: TokenStream): Identifier | MismatchToken {
    const identifier: Identifier = {
        type: "Identifier",
        name: "",
        line: 0,
        column: 0,
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

        identifier.line = currentToken.line
        identifier.column = currentToken.column

        tokens.advance()
    }
    else if (currentToken.type == "Word" && currentToken.value == "_") {
        identifier.name += "_"
        identifier.start = currentToken.start
        identifier.end = currentToken.end

        identifier.line = currentToken.line
        identifier.column = currentToken.column

        tokens.advance()
        currentToken = tokens.currentToken

        if (currentToken.type == "EOF") {
            tokens.cursor = initialCursor
            const error: DiagnosticMessage = "Unexpected end of input on {0}:{1}"
            return createMismatchToken(currentToken, [error, currentToken.line, currentToken.column])
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

        identifier.line = currentToken.line
        identifier.column = currentToken.column

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

    if(keywords.includes(identifier.name)) {
        const partialParse: PartialParse = {
            cursor: tokens.cursor,
            result: identifier
        }
        tokens.cursor = initialCursor
        return createMismatchToken(tokens.currentToken, partialParse)
    }

    return identifier
}

export function printIdentifier(token: Identifier, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = ' '.repeat(4)
    return "Identifier\n" + space.repeat(indent) + endJoiner +
       token.name
}