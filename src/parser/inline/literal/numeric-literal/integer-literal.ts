import { TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"

export function generateIntegerLiteral(context: Node, tokens: TokenStream): IntegerLiteral | MismatchToken {
    const integerLiteral: IntegerLiteral = {
        type: "IntegerLiteral",
        value: null!,
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const integer = parseInteger(tokens)
    if (integer.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return integer
    }

    integerLiteral.value = integer.value
    integerLiteral.start = integer.start

    integerLiteral.line = integer.line
    integerLiteral.column = integer.column

    integerLiteral.end = integer.end
    return integerLiteral

    function parseInteger(tokens: TokenStream) {
        let currentToken = tokens.currentToken

        if (currentToken.type != "Integer")
            return createMismatchToken(currentToken)

        const integer: LexicalToken = {
            ...currentToken,
        }

        tokens.advance()
        let wasPrevTokenUnderscore = false,
            isUnderscore = (token: LexicalToken) =>
                token.type == "Word" && token.value == "_"

        while (!tokens.isFinished) {
            currentToken = tokens.currentToken

            if (currentToken.type == "EOF") {
                if (wasPrevTokenUnderscore)
                    return createMismatchToken(tokens.peek(-1)!)
                break
            }

            if (isUnderscore(currentToken) && !wasPrevTokenUnderscore) {
                wasPrevTokenUnderscore = true
                tokens.advance()
                continue
            }

            if (currentToken.type != "Integer") {
                if (wasPrevTokenUnderscore)
                    return createMismatchToken(tokens.peek(-1)!)
                break
            }

            integer.value += currentToken.value
            integer.end = currentToken.end

            wasPrevTokenUnderscore = false
            tokens.advance()
        }

        return integer
    }
}