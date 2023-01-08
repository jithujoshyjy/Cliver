import { type TokenStream } from "../../../../lexer/token.js"
import { createMismatchToken, isOperator, type Node } from "../../../utility.js"
import { generateIntegerLiteral } from "./integer-literal.js"

export function generateFloatLiteral(context: Node, tokens: TokenStream): FloatLiteral | MismatchToken {
    const floatLiteral: FloatLiteral = {
        type: "FloatLiteral",
        value: "0",
        line: 0,
        column: 0,
        start: 0,
        end: 0
    }

    const initialCursor = tokens.cursor
    let currentToken = tokens.currentToken

    const integerPart = generateIntegerLiteral(floatLiteral, tokens)
    currentToken = tokens.currentToken

    if (integerPart.type == "IntegerLiteral")
        floatLiteral.value = integerPart.value

    if (!isOperator(currentToken, ".")) {

        const cursor = tokens.cursor
        if (integerPart.type == "IntegerLiteral")
            return createMismatchToken(currentToken, { cursor, result: integerPart })

        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    if (integerPart.type == "IntegerLiteral") {
        floatLiteral.start = integerPart.start
        floatLiteral.line = integerPart.line
        floatLiteral.column = integerPart.column
    }
    else {
        floatLiteral.start = currentToken.start
        floatLiteral.line = currentToken.line
        floatLiteral.column = currentToken.column
    }

    floatLiteral.value += "."
    tokens.advance()

    const floatPart = generateIntegerLiteral(floatLiteral, tokens)
    if (floatPart.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return floatPart
    }

    floatLiteral.value += floatPart.value
    floatLiteral.end = floatPart.end

    return floatLiteral
}