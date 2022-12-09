import { TokenStream, TokenType } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility.js"

export function generateSymbolLiteral(context: Node, tokens: TokenStream): SymbolLiteral | MismatchToken {
    const symbolLiteral: SymbolLiteral = {
        type: "SymbolLiteral",
        text: null!,
        charset: "ascii",
        kind: "char",
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor
    
    const symbolLiteralType = [
        TokenType.SymASCIICharLiteral, TokenType.SymUnicodeCharLiteral,
        TokenType.SymASCIIStringLiteral, TokenType.SymUnicodeStringLiteral
    ]

    if(!symbolLiteralType.includes(currentToken.type)) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    if(/string/ig.test(currentToken.type)) {
        symbolLiteral.kind = "string"
    }

    if(/unicode/ig.test(currentToken.type)) {
        symbolLiteral.charset = "unicode"
    }

    symbolLiteral.text = currentToken.value as string

    // tokens.advance()
    return symbolLiteral
}