import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, type Node } from "../../utility.js"

export function generateStringLiteral(context: Node, tokens: TokenStream): StringLiteral | MismatchToken {
    const stringLiteral: StringLiteral = {
        type: "StringLiteral",
        text: null!,
        kind: "inline",
        charset: "ascii",
        start: 0,
        end: 0
    }

    let currentToken = tokens.currentToken
    const initialCursor = tokens.cursor

    /* const inlineStr = [TokenType.InlineASCIIStringLiteral, TokenType.InlineUnicodeStringLiteral]
    const multilineStr = [TokenType.MultilineASCIIStringLiteral, TokenType.MultilineUnicodeStringLiteral]

    const isStr = inlineStr.includes(currentToken.type) || multilineStr.includes(currentToken.type)
    if(!isStr) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    stringLiteral.text = currentToken.value[0] as string ?? ""

    if(/multiline/ig.test(currentToken.type)) {
        stringLiteral.kind = "multiline"
    }

    if(/unicode/ig.test(currentToken.type)) {
        stringLiteral.charset = "unicode"
    }

    stringLiteral.start = currentToken.start
    stringLiteral.end = currentToken.end */return createMismatchToken(currentToken)
    return stringLiteral
}