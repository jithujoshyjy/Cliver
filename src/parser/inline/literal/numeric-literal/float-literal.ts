import { TokenStream, TokenType } from "../../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../../utility.js"

export function generateFloatLiteral(context: Node, tokens: TokenStream): FloatLiteral | MismatchToken {
    const floatLiteral: FloatLiteral = {
        type: "FloatLiteral",
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

    floatLiteral.value = currentToken.value as string

    return floatLiteral
}