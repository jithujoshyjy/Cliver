import { TokenStream, TokenType } from "../../lexer/token.js"
import { createMismatchToken, skip, skipables, stringLiterals, _skipables, type Node } from "../utility"
import { generateExpression } from "./expression/expression.js"

export function generateInline(context: Node, tokens: TokenStream): Inline | MismatchToken {
    const inline: Inline = {
        type: "Inline",
        value: null!,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = skip(tokens, skipables)

    const captureDelimiter = () => {
        currentToken = skip(tokens, _skipables)
        const isDelimited = currentToken.type == TokenType.Newline
            || (currentToken.type == TokenType.Punctuator && currentToken.value == ";")
            || tokens.isFinished

        if (!isDelimited) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        return currentToken
    }

    const expression = generateExpression(inline, tokens)
    if (expression.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return expression
    }

    inline.value = expression

    const delimiter = captureDelimiter()

    if (delimiter.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return delimiter
    }

    return inline
}