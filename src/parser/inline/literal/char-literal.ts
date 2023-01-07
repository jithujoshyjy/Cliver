import { TokenStream } from "../../../lexer/token.js"
import { createMismatchToken, isPunctuator, type Node } from "../../utility.js"
import { generateEscapeSequence } from "./escape-sequence.js"

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

    if(!isPunctuator(currentToken, "'")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    charLiteral.start = currentToken.start
    tokens.advance()

    currentToken = tokens.currentToken
    if(isPunctuator(currentToken, '\\')) {
        const escapeSequence = generateEscapeSequence(charLiteral, tokens)
        if(escapeSequence.type == "MismatchToken") {
            tokens.cursor = initialCursor
            return escapeSequence
        }
        charLiteral.text = escapeSequence
        charLiteral.charset =  escapeSequence.value.codePointAt(0)! > 127 ? "unicode" : "ascii"
    }
    else {

        if(currentToken.type == "EOF") {
            tokens.cursor = initialCursor
            const error = `SyntaxError: Unexpected end of input on ${currentToken.line}:${currentToken.column}`
            return createMismatchToken(currentToken, error)
        }

        charLiteral.text = currentToken.value
        if(/[\s\S]{2,}/u.test(currentToken.value)) {
            tokens.cursor = initialCursor
            return createMismatchToken(currentToken)
        }

        charLiteral.charset = charLiteral.text.codePointAt(0)! > 127 ? "unicode" : "ascii"
        tokens.advance()
    }

    currentToken = tokens.currentToken
    if(!isPunctuator(currentToken, "'")) {
        tokens.cursor = initialCursor
        return createMismatchToken(currentToken)
    }

    charLiteral.end = currentToken.end
    tokens.advance()

    return charLiteral
}