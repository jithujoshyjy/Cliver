import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"

export function generateIntegerLiteral(context: Node, tokens: TokenStream): IntegerLiteral | MismatchToken {
    const integerLiteral: IntegerLiteral = {
        type: "IntegerLiteral",
        value: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    if(currentToken.type != TokenType.FloatLiteral) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    integerLiteral.value = currentToken.value as string

    return integerLiteral
}