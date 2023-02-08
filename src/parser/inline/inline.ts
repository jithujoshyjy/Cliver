import { TokenStream } from "../../lexer/token.js"
import { createMismatchToken, isKeyword, isPunctuator, skip, skipables, _skipables, type Node } from "../utility.js"
import { generateExpression, printExpression } from "./expression/expression.js"
import { generateKeyword } from "./keyword.js"

export function generateInline(context: Node, tokens: TokenStream): Inline | MismatchToken {
    const inline: Inline = {
        type: "Inline",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    if (skipables.includes(currentToken))
        currentToken = skip(tokens, skipables)

    const expression = generateExpression(inline, tokens)
    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }
    
    const captureDelimiter = () => {
        currentToken = tokens.currentToken

        if (_skipables.includes(currentToken))
            currentToken = skip(tokens, _skipables)

        let isDelimited = currentToken.type == "Newline"
            || isPunctuator(currentToken, ";")
            || currentToken.type == "EOF"
        
        const resetCursorPoint = tokens.cursor
        isDelimited ||= generateKeyword(inline, tokens).type == "Keyword"
        tokens.cursor = resetCursorPoint

        if (!isDelimited)
            return createMismatchToken(currentToken)
        
        return currentToken
    }

    inline.start = expression.start
    inline.value = expression
    const delimiter = captureDelimiter()

    if (delimiter.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return delimiter
    }

    currentToken = skip(tokens, skipables)
    inline.end = delimiter.end
    
    return inline
}

export function printInline(token: Inline, indent = 0) {
    const middleJoiner = "├── "
    const endJoiner = "└── "
    const trailJoiner = "│\t"
    const space = ' '.repeat(4)
    return "Inline\n" + space.repeat(indent) + endJoiner + printExpression(token.value, indent+1)
}