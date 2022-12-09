import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility.js"

export function generateCharLiteral(context: Node, tokens: TokenStream): CharLiteral | MismatchToken {
    const charLiteral: CharLiteral = {
        type: "CharLiteral",
        charset: "ascii",
        text: null!,
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    const charTypes = [
        TokenType.ASCIICharLiteral, TokenType.UnicodeCharLiteral
    ]
    
    if (!charTypes.includes(currentToken.type)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    if(currentToken.type == TokenType.UnicodeCharLiteral) {
        charLiteral.charset = "unicode"
    }

    charLiteral.text = currentToken.value as string

    // tokens.advance()
    return charLiteral
}