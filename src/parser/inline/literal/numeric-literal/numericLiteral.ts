import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"
import { generateFloatLiteral } from "./float-literal.js"
import { generateIntegerLiteral } from "./integer-literal.js"

export function generateNumericLiteral(context: Node, tokens: TokenStream): NumericLiteral | MismatchToken {
    const numericLiteral: NumericLiteral = {
        type: "NumericLiteral",
        value: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const validTokens = [
        TokenType.IntegerLiteral,
        TokenType.FloatLiteral
    ]

    if(!validTokens.includes(currentToken.type)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }
    
    let number: typeof numericLiteral.value | MismatchToken = generateFloatLiteral(numericLiteral, tokens)
    if(number.type == "MismatchToken") {
        number = generateIntegerLiteral(numericLiteral, tokens)
    }

    if(number.type == "MismatchToken") {
        tokens.cursor = initialCursor
        return number
    }

    numericLiteral.value = number
    numericLiteral.start = number.start
    numericLiteral.end = number.end

    return numericLiteral
}